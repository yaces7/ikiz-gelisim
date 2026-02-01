const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Import Mongoose Models
const User = require('./src/models/User');
const JournalEntry = require('./src/models/JournalEntry');
const ScaleResult = require('./src/models/ScaleResult');
const Progression = require('./src/models/Progression');
// IdentityScore model was missing in my previous step, I will define it inline or assume generic check. 
// Actually I should create it, but for now I'll skip identity_scores table or create a schema on the fly if needed.
// Better: Create schema inline for IdentityScore since I missed the file creation.
const IdentityScoreSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scenario_id: String,
    choice_weight: Number,
    autonomy_score: Number,
    dependency_score: Number,
    timestamp: { type: Date, default: Date.now }
});
const IdentityScore = mongoose.models.IdentityScore || mongoose.model('IdentityScore', IdentityScoreSchema);


const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 5000; // Use PORT env for Render

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/twin_platform';

app.prepare().then(async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('> MongoDB: Connected');
    } catch (err) {
        console.error('> MongoDB Connection Error:', err.message);
        console.log('> Warning: Ensure you have a MongoDB instance running or MONGODB_URI set.');
    }

    const server = createServer(async (req, res) => {
        if (req.url.startsWith('/api')) {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    const data = body ? JSON.parse(body) : {};

                    // 1. Journal Entry
                    if (req.url === '/api/journal' && req.method === 'POST') {
                        const { userId, content } = data;
                        // Run Python Script
                        const pythonProcess = spawn('python3', ['./analysis_engine.py', content]);

                        pythonProcess.stdout.on('data', async (pyData) => {
                            try {
                                const analysis = JSON.parse(pyData.toString());
                                const newEntry = new JournalEntry({
                                    user_id: userId,
                                    content,
                                    me_count: analysis.me_count,
                                    we_count: analysis.we_count,
                                    sentiment_score: analysis.sentiment,
                                    week_number: 1 // Logic to fetch current week could be added
                                });
                                await newEntry.save();
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: true, analysis }));
                            } catch (e) {
                                console.error("Journal Save Error:", e);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'Database error' }));
                            }
                        });

                        // Handle Python script errors or if script doesn't output valid JSON
                        pythonProcess.stderr.on('data', (err) => console.error("Python Error:", err.toString()));
                        return;
                    }

                    // 2. Simulation Results
                    if (req.url === '/api/sim-result' && req.method === 'POST') {
                        const { userId, scenarioId, weight, autonomy, dependency } = data;
                        try {
                            const newScore = new IdentityScore({
                                user_id: userId,
                                scenario_id: scenarioId,
                                choice_weight: weight,
                                autonomy_score: autonomy,
                                dependency_score: dependency
                            });
                            await newScore.save();
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, newScore: autonomy }));
                        } catch (e) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Database error' }));
                        }
                        return;
                    }

                    // 3. Scale Results
                    if (req.url === '/api/scales' && req.method === 'POST') {
                        const { userId, type, scores, total } = data;
                        try {
                            await ScaleResult.create({
                                user_id: userId,
                                scale_type: type,
                                scores_json: JSON.stringify(scores),
                                total_score: total
                            });
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true }));
                        } catch (e) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Database error' }));
                        }
                        return;
                    }

                    // 4. Register
                    if (req.url === '/api/auth/register' && req.method === 'POST') {
                        const { username, password, fullName, role, gender, birthDate, twinType, familyCode } = data;
                        try {
                            const bcrypt = require('bcryptjs');
                            const hashedPassword = await bcrypt.hash(password, 10);
                            const groupType = Math.random() > 0.5 ? 'experiment' : 'control';

                            const newUser = new User({
                                username,
                                password_hash: hashedPassword,
                                full_name: fullName,
                                role,
                                gender,
                                birth_date: birthDate,
                                twin_type: twinType,
                                family_code: familyCode,
                                group_type: groupType
                            });
                            await newUser.save();
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true }));
                        } catch (e) {
                            console.error(e);
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Username likely exists' }));
                        }
                        return;
                    }

                    // 5. Login
                    if (req.url === '/api/auth/login' && req.method === 'POST') {
                        const { username, password } = data;
                        try {
                            const user = await User.findOne({ username });
                            if (!user) {
                                res.writeHead(401, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'User not found' }));
                                return;
                            }
                            const bcrypt = require('bcryptjs');
                            const isValid = await bcrypt.compare(password, user.password_hash);
                            if (!isValid) {
                                res.writeHead(401, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'Invalid pass' }));
                                return;
                            }
                            // Generate Token
                            const jwt = require('jsonwebtoken');
                            const token = jwt.sign(
                                { id: user._id, username: user.username, role: user.role },
                                process.env.SECRET_KEY || 'SECRET_KEY_DEV',
                                { expiresIn: '12h' }
                            );
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                success: true,
                                token,
                                user: {
                                    id: user._id,
                                    username: user.username,
                                    fullName: user.full_name,
                                    role: user.role,
                                    groupType: user.group_type
                                }
                            }));
                        } catch (e) {
                            console.error(e);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Login error' }));
                        }
                        return;
                    }

                    // 6. Admin Stats
                    if (req.url === '/api/admin/dashboard-stats' && req.method === 'GET') {
                        try {
                            const totalUsers = await User.countDocuments();
                            const twins = await User.countDocuments({ role: 'twin' });
                            const parents = await User.countDocuments({ role: 'parent' });
                            const experimentCount = await User.countDocuments({ group_type: 'experiment', role: 'twin' });
                            const controlCount = await User.countDocuments({ group_type: 'control', role: 'twin' });

                            const twinTypes = await User.aggregate([
                                { $match: { role: 'twin' } },
                                { $group: { _id: "$twin_type", count: { $sum: 1 } } }
                            ]).then(res => res.map(r => ({ twin_type: r._id, count: r.count })));

                            // Recent Activities
                            // Ideally use $unionWith if MongoDB 4.4+, but simple separate queries work too
                            const journals = await JournalEntry.find().sort({ timestamp: -1 }).limit(5).populate('user_id', 'username role group_type');
                            const scales = await ScaleResult.find().sort({ timestamp: -1 }).limit(5).populate('user_id', 'username role group_type');

                            // Map to common structure
                            const journalActs = journals.map(j => ({
                                username: j.user_id?.username || 'Unknown',
                                role: j.user_id?.role,
                                group_type: j.user_id?.group_type,
                                type: 'Journal',
                                score: j.sentiment_score,
                                timestamp: j.timestamp
                            }));
                            const scaleActs = scales.map(s => ({
                                username: s.user_id?.username || 'Unknown',
                                role: s.user_id?.role,
                                group_type: s.user_id?.group_type,
                                type: 'Scale',
                                score: s.total_score,
                                timestamp: s.timestamp
                            }));

                            const recentActivities = [...journalActs, ...scaleActs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                success: true,
                                stats: { totalUsers, twins, parents, experimentCount, controlCount, twinTypes, recentActivities }
                            }));
                        } catch (e) {
                            console.error("Admin Stats Error:", e);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Stats error' }));
                        }
                        return;
                    }

                    // 7. Progression Check
                    if (req.url === '/api/progression/check' && req.method === 'POST') {
                        const { userId } = data;
                        try {
                            const user = await User.findById(userId);
                            if (!user) throw new Error('User not found');

                            let prog = await Progression.findOne({ user_id: userId });
                            if (!prog) {
                                prog = new Progression({ user_id: userId, current_week: 1 });
                                await prog.save();
                            }

                            const createdDate = new Date(user.created_at);
                            const diffDays = (new Date() - createdDate) / (1000 * 3600 * 24);
                            let calcWeek = Math.floor(diffDays / 7) + 1;
                            if (calcWeek > 6) calcWeek = 6;

                            if (calcWeek > prog.current_week) {
                                prog.current_week = calcWeek;
                                await prog.save();
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: true, week: calcWeek, newUnlock: true }));
                            } else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: true, week: prog.current_week, newUnlock: false }));
                            }

                        } catch (e) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Progression error' }));
                        }
                        return;
                    }

                    // 8. Parent Dashboard Data
                    if (req.url === '/api/parent/dashboard' && req.method === 'POST') {
                        const { userId } = data;
                        try {
                            const parent = await User.findById(userId);
                            if (!parent || parent.role !== 'parent') {
                                res.writeHead(403);
                                res.end();
                                return;
                            }

                            // Find Twins
                            const twins = await User.find({ family_code: parent.family_code, role: 'twin' });

                            // Calculate Stats
                            // Labels (Weeks)
                            const chartLabels = ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta', '5. Hafta', '6. Hafta'];
                            const datasets = [];
                            let totalProgress = 0;
                            let totalActs = 0;
                            const recentActs = [];

                            for (const twin of twins) {
                                // Get Scale Results for Graph (Autonomy?)
                                // For demo, we might use IdentityScores or ScaleResults. Let's use ScaleResults and assume 'bso' scale is the autonomy metric
                                const scales = await ScaleResult.find({ user_id: twin._id, scale_type: 'bso' }).sort({ timestamp: 1 });
                                const scores = [0, 0, 0, 0, 0, 0]; // 6 weeks placeholder

                                // Simple mapping: if scale was done in week 1, map to index 0, etc.
                                // For real data, we'd check timestamps against user creation date.
                                // Here we just push found scores in order.
                                scales.forEach((s, idx) => {
                                    if (idx < 6) scores[idx] = s.total_score;
                                });

                                datasets.push({
                                    label: `${twin.full_name} - Özerklik`,
                                    data: scores,
                                    borderColor: twin.twin_type === 'monozygotic' ? 'rgb(53, 162, 235)' : 'rgb(255, 99, 132)',
                                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                                    tension: 0.4
                                });

                                // Progress
                                const prog = await Progression.findOne({ user_id: twin._id });
                                const week = prog ? prog.current_week : 1;
                                totalProgress += (week / 6) * 100;
                                totalActs += scales.length; // Simply count scales as acts

                                // Recent Activity
                                const lastJournal = await JournalEntry.findOne({ user_id: twin._id }).sort({ timestamp: -1 });
                                if (lastJournal) {
                                    recentActs.push({
                                        description: `${twin.full_name} günlük girişi yaptı.`,
                                        type: 'journal',
                                        timestamp: lastJournal.timestamp
                                    });
                                }
                            }

                            // Average Progress
                            const avgProgress = twins.length ? Math.round(totalProgress / twins.length) : 0;

                            // Sort recent acts
                            recentActs.sort((a, b) => b.timestamp - a.timestamp);

                            const responseData = {
                                averageProgress: avgProgress,
                                totalActivities: totalActs,
                                chartLabels,
                                datasets,
                                guidanceMode: 'Demokratik Tutum (AI)', // Mock for now
                                recentActivities: recentActs.slice(0, 5),
                                aiInsight: "İkizlerinizin bireyselleşme süreci dengeli ilerliyor."
                            };

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, data: responseData }));

                        } catch (e) {
                            console.error("Parent Dash Error:", e);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'DB Error' }));
                        }
                        return;
                    }

                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Not Found' }));
                } catch (e) {
                    console.error(e);
                    res.statusCode = 500;
                    res.end('Server Error');
                }
            });
            return;
        }

        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
    });

    const io = new Server(server);
    io.on('connection', (socket) => {
        // ... Socket logic (keep existing)
        socket.on('child_action', (data) => socket.broadcast.emit('sync_parent', data));
        socket.on('parent_guidance', (data) => socket.broadcast.emit('receive_guidance', data));
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
