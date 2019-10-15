var fs = require('fs')
var bot = require("./bot.js")

var read_book = function (src) {
    var book_1 = fs.readFileSync(src, 'utf-8')

    bot.store_text(book_1);
}
// helpers
let minimum_length = function (length1, length2) {
    if (length1 > length2) {
        return length2
    } else {
        return length1
    }
}
// find out charset to read books-- uses https://www.npmjs.com/package/charset-detector



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
    //cleanup of the input string
    let input_words = bot.clean_up_sentence(input_text);
    input_words = bot.cleanup_words(input_words)

    // this selects a word out of the input 
    // expand this section!!!!
    let selected_word = function (word) {
        var input_index = Math.floor(Math.random() * input_words.length)
        let the_word = "";
        if (word[input_index] === "" || word[input_index] === "." || word[input_index] === "," || word[input_index] === "!" || word[input_index] === "?") {
            the_word = input_words[input_index - 1]
        } else {
            the_word = input_words[input_index]
        }
        return the_word
    }

    selected_word = selected_word(input_words)
    console.log("selected " + selected_word)

    // this starts the search of the answer
    let possible_three_words_forward = Object.keys(bot.storage_dictionary.normal).filter(function (three_words) {
        return three_words.indexOf(selected_word) > -1;
    });
    let possible_three_words_reverse = Object.keys(bot.storage_dictionary.reverse).filter(function (three_words) {
        return three_words.indexOf(selected_word) > -1;
    });
    //console.log(possible_three_words_reverse)
    if (possible_three_words_forward.length > 0) {
        // reconstruct has to access inner object
        var random_index = Math.floor(Math.random() *possible_three_words_forward.length)
        let selected_three_words_fwd = possible_three_words_forward[random_index]
        let selected_three_words_rev = possible_three_words_reverse[random_index]

        let new_sentence_fwd = bot.reconstruct_sentence_fwd(selected_three_words_fwd);
        let new_sentence_rev = bot.reconstruct_sentence_rev(selected_three_words_rev);

        console.log(new_sentence_rev)
        
        
        
        let new_sentence = new_sentence_rev +" "+ new_sentence_fwd
        return new_sentence
    } else {
        var new_sentence = "Tell me more, talking about " + selected_word + " sounds interresting"
    }


    return new_sentence
}

//console.log(new_sentence)
//console.log(book_1.indexOf(new_sentence))
//console.log(bot.storage_dictionary)

// BOT CONNEXION
let the_slack_botter= function () {
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
}
the_slack_botter()
