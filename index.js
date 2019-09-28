var fs = require('fs')
var bot = require("./bot.js")

var read_book = function (src) {
    var book_1 = fs.readFileSync(src, 'utf-8')

    bot.store_text(book_1);
}
//read from this dictionary

var process_books = function (error, booknames) {
    for (let i = 0; i < booknames.length; i++) {
        var bookname = booknames[i]
        if (bookname.indexOf('.txt') > -1) {
            read_book('./books/' + bookname)
            console.log(bookname)
        }
    }
}
fs.readdir('./books', process_books);
// everyday it stores a new book
var current_book_name = "./books/" + new Date() + '.txt';

// how it fixes the text that was inserted

var sentence_selection = function (input_text) {
    const quest_1 = /\?/gm;
    let sentence_repl_quest = input_text.replace(quest_1, " ? ")
    const comma_1 = /\,/gm;
    let sentence_repl_comma = sentence_repl_quest.replace(comma_1, " , ")
    const stop_1 = /\./gm;
    let sentence_repl_stop = sentence_repl_comma.replace(stop_1, " . ")
    const exclamation_1 = /\!/gm;
    let sentence_repl_exlam = sentence_repl_stop.replace(exclamation_1, " ! ")
    sentence = sentence_repl_exlam;

    var input_words = sentence_repl_exlam.split(" ")
    // remove extra ""empty arrays

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
    input_words = cleanup_words(input_words)

    // this selects a word out of the input 
    // expand this section!!!!
    let selected_word = function (word) {
        var input_index = Math.floor(Math.random() * input_words.length)
        let the_word = "";
        if (word[input_index] === "" || word[input_index] === "." || word[input_index] === "," || word[input_index] === "!" ||word[input_index] === "?"){
             the_word = input_words[input_index - 1] 
        }else{
            the_word = input_words[input_index]
        }
        return the_word
} 

    selected_word = selected_word(input_words)
    //old function
    // var input_index = Math.floor(Math.random() * input_words.length)
    // var selected_word = input_words[input_index]




    console.log("selected " + selected_word)

    // this starts the search of the answer
    var possible_three_words = Object.keys(bot.storage_dictionary).filter(function (three_words) {
        return three_words.indexOf(selected_word) > -1
    });

    if (possible_three_words.length > 0) {
        var random_index = Math.floor(Math.random() * possible_three_words.length);
        var selected_three_words = possible_three_words[random_index]
        var new_sentence = bot.reconstruct_sentence(selected_three_words);
    } else {
        var new_sentence = "Tell me more, talking about " + selected_word + " sounds interresting"
    }


    return new_sentence
}

//console.log(new_sentence)
//console.log(book_1.indexOf(new_sentence))
//console.log(bot.storage_dictionary)

// BOT CONNEXION

var SlackBot = require('slackbots');

// create a bot
var config = require("./config");
var slack_bot = new SlackBot(config);

slack_bot.on('start', function () {
    var user = slack_bot.users.find(function (user) {
        if (user.real_name === slack_bot.name) {
            return true
        }
    })
    slack_bot.id = user.id

    // define channel, where bot exist. You can adjust it there https://my.slack.com/services 
});
slack_bot.on('message', function (data) {
    if (data.type !== "message" || !data.text || data.user === slack_bot.id) {
        return
    }
    // all ingoing events https://api.slack.com/rtm
    console.log(data.text);
    var mentioned = `<@${slack_bot.id}>`;
    var random = Math.random() * 100;
    if (data.text && (data.text.indexOf(mentioned) > -1) || random > 80) {
        var channel = slack_bot.channels.find(function (channel) {
            return channel.id === data.channel
        })
        var reply = sentence_selection(data.text)
        reply = reply.replace(/<@self>/g, `<@${data.user}>`)
        slack_bot.postMessageToChannel(channel.name, sentence_selection(data.text));
    }
    data.text = data.text.replace(new RegExp(mentioned), "<@self>")
    bot.store_text(data.text)

    fs.appendFileSync(current_book_name, data.text + ' . ')
});