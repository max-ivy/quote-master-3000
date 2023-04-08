from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from bson import ObjectId

app = Flask(__name__)
app.config["MONGO_URI"] = "MONGO_URI"
mongo = PyMongo(app)

class Quote:
    def __init__(self, quote, author, category):
        self.quote = quote
        self.author = author
        self.category = category

    def to_dict(self):
        return {
            "quote": self.quote,
            "author": self.author,
            "category": self.category,
        }

# Homepage
@app.route("/")
def index():
    featured_quote = mongo.db.quotes.aggregate([{"$sample": {"size": 1}}]).next() if mongo.db.quotes.count_documents({}) > 0 else None
    quotes = list(mongo.db.quotes.find())
    return render_template('index.html', featured_quote=featured_quote, quotes=quotes, categories=set([quote['category'] for quote in quotes]), unique_authors=set([quote['author'] for quote in quotes]))

# Add quote
@app.route('/add_quote', methods=['POST'])
def add_quote():
    quote_text = request.form['quote']
    author = request.form['author']
    category = request.form['category']
    new_quote = Quote(quote_text, author, category)
    new_quote_dict = new_quote.to_dict()
    new_quote_dict['_id'] = ObjectId()
    mongo.db.quotes.insert_one(new_quote_dict)
    return redirect(url_for('index'))

# Delete quote
# Delete quote
# Delete quote
@app.route('/delete_quote', methods=['POST'])
def delete_quote():
    quote_text = request.form['quote_text']
    mongo.db.quotes.delete_one({"quote": quote_text})
    return redirect(url_for('index'))

# Serve quotes as JSON
@app.route("/quotes")
def get_quotes():
    quotes = mongo.db.quotes.find()
    quotes_dict = []
    for quote in quotes:
        quote["_id"] = str(quote["_id"])  # Convert ObjectId to string
        quotes_dict.append(quote)
    return jsonify(quotes_dict)

@app.route("/filter", methods=["POST"])
def filter():
    filter_type = request.form.get("filter_type")
    filter_value = request.form.get("filter_value")
    author_filter = request.form.get("author_filter")
    quotes = list(mongo.db.quotes.find())  # Retrieve quotes from MongoDB

    if filter_type == "author" and author_filter:
        filtered_quotes = [quote for quote in quotes if author_filter.lower() == quote['author'].lower()]
    elif filter_type == "keyword" and filter_value:
        filtered_quotes = [quote for quote in quotes if filter_value.lower() in quote['quote'].lower()]
    else:
        filtered_quotes = quotes

    return render_template('index.html', featured_quote=None, quotes=filtered_quotes, categories=set([quote['category'] for quote in quotes]), unique_authors=set([quote['author'] for quote in quotes]))

if __name__ == '__main__':
    app.run(debug=True, port=9002)
