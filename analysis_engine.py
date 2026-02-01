import sys
import json

def analyze_text(text):
    # Basic Tokenization for "Ben" vs "Biz"
    words = text.lower().split()
    total_words = len(words)
    
    if total_words == 0:
        return json.dumps({"me_ratio": 0, "we_ratio": 0, "sentiment": 0})

    me_keywords = ['ben', 'benim', 'bana', 'kendim']
    we_keywords = ['biz', 'bizim', 'bize', 'ikimiz']

    me_count = sum(1 for w in words if w in me_keywords)
    we_count = sum(1 for w in words if w in we_keywords)

    me_ratio = me_count / total_words
    we_ratio = we_count / total_words

    # Simple Keyword-based Sentiment (Mock)
    positive_words = ['mutlu', 'iyi', 'güzel', 'seviyorum', 'harika']
    negative_words = ['kötü', 'üzgün', 'nefret', 'kızgın', 'yalnız']
    
    pos_score = sum(1 for w in words if w in positive_words)
    neg_score = sum(1 for w in words if w in negative_words)
    sentiment = (pos_score - neg_score) / (total_words or 1) * 10 

    result = {
        "me_count": me_count,
        "we_count": we_count,
        "me_ratio": round(me_ratio, 2),
        "we_ratio": round(we_ratio, 2),
        "sentiment": round(sentiment, 2),
        "analysis_note": "High Dependency Risk" if we_ratio > 0.7 else "Balanced"
    }
    
    return json.dumps(result)

if __name__ == "__main__":
    input_text = sys.argv[1]
    print(analyze_text(input_text))
