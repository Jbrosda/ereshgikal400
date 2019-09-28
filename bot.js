var extract_key_value_from_sentence = function (sentence) {
    //append __END__ to signal end of sentence
    sentence = sentence + " __END__"
    // make !, , , ?, . , arrays of their own
    const quest_1 = /\?/gm;
    let sentence_repl_quest = sentence.replace(quest_1, " ? ")
    const comma_1 = /\,/gm;
    let sentence_repl_comma = sentence_repl_quest.replace(comma_1, " , ")
    const stop_1 = /\./gm;
    let sentence_repl_stop = sentence_repl_comma.replace(stop_1, " . ")
    const exclamation_1 = /\!/gm;
    let sentence_repl_exlam = sentence_repl_stop.replace(exclamation_1, " ! ")
    sentence = sentence_repl_exlam;

    var words = sentence.split(" ")
    //remove 2double and more key"" from array
    let cleanup_words = function (input_array) {
        let clean = []
        for (i = 0; i < input_array.length; i++) {
            if (input_array[i] === "" && input_array[i + 1] === "") {
                i++
            } else {
                clean.push(input_array[i])
            }
        }
        return clean
    }
    words = cleanup_words(words)
    
    var result = {}
    for (var i = 0; i < words.length - 3; i++) {
        var three_words = words[i] + " " + words[i + 1] + " " + words[i + 2]
        var next_word = words[i + 3];
        result[three_words] = next_word;
    }
    return result
}
// here is how the words are stored
var storage_dictionary = {}

var store_key_values = function (key_values) {
    var keys = Object.keys(key_values)
    for (var i = 0; i < keys.length; i++) {
        var three_words = keys[i]
        var next_word = key_values[three_words]
        if (!storage_dictionary[three_words]) {
            storage_dictionary[three_words] = {};
        }
        if (storage_dictionary[three_words][next_word]) {
            storage_dictionary[three_words][next_word] = storage_dictionary[three_words][next_word] + 1;
        } else {
            storage_dictionary[three_words][next_word] = 1;
        }
    }
}
var reconstruct_sentence = function (three_words) {
    // create a collector with three words as initial value
    var result = three_words;
    while (true) {
        // get possible next words and occurance counts
        var possible_next_words_with_occurance = storage_dictionary[three_words];
        // most frequent
        var most_frequent_next_word;
        var max_occurance = 0;
        //console.log(three_words, possible_next_words_with_occurance)
        var possible_next_words = Object.keys(possible_next_words_with_occurance);
        var random_index = Math.floor(Math.random() * possible_next_words.length);
        var next_word = possible_next_words[random_index];



        if (next_word === "__END__") {
            return result;
        }
        // the next lines are for most used  next words
        // for (var possible_next_word of possible_next_words) {
        //     var occurance = possible_next_words_with_occurance[possible_next_word]
        //     if (occurance > max_occurance) {
        //         max_occurance = occurance;
        //         most_frequent_next_word = possible_next_word;
        //     }
        // }
        // var next_word = most_frequent_next_word

        // if we reach an ending of sentence

        // add to result
        result = result + " " + next_word
        // change the original three words
        var three_words_split = three_words.split(" ")
        // remove the first of three
        three_words_split.shift();
        //add the next word to the three words
        three_words_split.push(next_word)
        // change key
        three_words = three_words_split.join(" ");
    }

};
var store_text = function (text) {
    var sentences = text.split(".");
    for (var sentence of sentences) {
        var sentence_key_value = extract_key_value_from_sentence(sentence.trim())
        store_key_values(sentence_key_value)
    }
}
//console.log(storage_dictionary);
module.exports = {
    store_text: store_text,
    reconstruct_sentence: reconstruct_sentence,
    storage_dictionary: storage_dictionary,
}