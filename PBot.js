const { Client } = require('discord.js');
const ytdl = require('ytdl-core');
const { token } = require('./token.json');
const { prefix } = require('./config.json');
const  googleIt = require('google-it')
const jieba = require('nodejieba')
const img = require('images-scraper')
const google = new img({
    puppeteer: {
        headless : true,
    }
})
const client = new Client();

let quizQueue = [];

// 建立一個類別來管理 Property 及 Method
class PBot {

    constructor() {
        this.isPlaying = {};
        this.queue = {};
        this.connection = {};
        this.dispatcher = {};
    }

    async join(msg) {

        // 如果使用者正在頻道中
        if (msg.member.voice.channel !== null) {
            // Bot 加入語音頻道
            this.connection[msg.guild.id] = await msg.member.voice.channel.join();
            console.log(`Logged in as ${client.user.tag}!`);
        } else {
            msg.channel.send('請先進入語音頻道');
        }

    }

    async play(msg) {

        // 語音群的 ID
        const guildID = msg.guild.id;

        // 如果 Bot 還沒加入該語音群的語音頻道
        if (!this.connection[guildID]) {
            msg.channel.send('請先將機器人 `##join` 加入頻道');
            return;
        }

        // 如果 Bot leave 後又未加入語音頻道
        if (this.connection[guildID].status === 4) {
            msg.channel.send('請先將機器人 `##join` 重新加入頻道');
            return;
        }

        // 處理字串，將 ##play 字串拿掉，只留下 YouTube 網址
        const musicURL = msg.content.replace(`${prefix}play`, '').trim();

        try {

            // 取得 YouTube 影片資訊
            const res = await ytdl.getInfo(musicURL);
            const info = res.videoDetails;

            // 將歌曲資訊加入隊列
            if (!this.queue[guildID]) {
                this.queue[guildID] = [];
            }

            this.queue[guildID].push({
                name: info.title,
                url: musicURL
            });

            // 如果目前正在播放歌曲就加入隊列，反之則播放歌曲
            if (this.isPlaying[guildID]) {
                msg.channel.send(`歌曲加入隊列：${info.title}`);
                //console.log(this.queue)
            } else {
                this.isPlaying[guildID] = true;
                this.playMusic(msg, guildID, this.queue[guildID][0]);
            }

        } catch(e) {
            console.log(e);
        }

    }

    playMusic(msg, guildID, musicInfo) {

        // 提示播放音樂
        msg.channel.send(`播放音樂：${musicInfo.name}`);

        // 播放音樂
        this.dispatcher[guildID] = this.connection[guildID].play(ytdl(musicInfo.url, { filter: 'audioonly' }));

        // 把音量降 50%，不然第一次容易被機器人的音量嚇到 QQ
        this.dispatcher[guildID].setVolume(0.2);

        // 移除 queue 中目前播放的歌曲
        this.queue[guildID].shift();

        // 歌曲播放結束時的事件
        const self = this;
        this.dispatcher[guildID].on('finish', () => {

            // 如果隊列中有歌曲
            if (self.queue[guildID].length > 0) {
                self.playMusic(msg, guildID, self.queue[guildID][0]);
            } else {
                self.isPlaying[guildID] = false;
                msg.channel.send('目前沒有音樂，伺服器一片沉寂');
            }

        });

    }

    resume(msg) {

        if (this.dispatcher[msg.guild.id]) {
            msg.channel.send('恢復播放');

            // 恢復播放
            this.dispatcher[msg.guild.id].resume();
        }

    }

    pause(msg) {

        if (this.dispatcher[msg.guild.id]) {
            msg.channel.send('暫停播放');

            // 暫停播放
            this.dispatcher[msg.guild.id].pause();
        }

    }

    skip(msg) {

        if (this.dispatcher[msg.guild.id]) {
            msg.channel.send('跳過目前歌曲');

            // 跳過歌曲
            this.dispatcher[msg.guild.id].end();
        }

    }

    nowQueue(msg) {

        // 如果隊列中有歌曲就顯示
        if (this.queue[msg.guild.id] && this.queue[msg.guild.id].length > 0) {
            // 字串處理，將 Object 組成字串
            const queueString = this.queue[msg.guild.id].map((item, index) => `[${index+1}] ${item.name}\n`).join();
            msg.channel.send(queueString);
        } else {
            msg.channel.send('目前隊列中沒有歌曲');
        }

    }

    async loadSongs(msg) {
        var fs=require('fs');
        var file="songs.json";
        fs.readFile(file,function(err,data){
            var result = JSON.parse(data)
            msg.channel.send('以下是您的儲存歌單:');
            for(var url in result.songs){
                msg.channel.send(result.songs[url]['songURL']);
                //console.log(result.songs[url]['songURL'])
            }
        })
    }

    async addSongs(msg) {

        // 處理字串，將 ##add 字串拿掉，只留下 YouTube 網址
        const musicURL = msg.content.replace(`${prefix}add`, '').trim();

        var fs=require('fs');
        var file="songs.json";
        fs.readFile(file,function(err,data){
            var result = JSON.parse(data)
            let newSong = {
                "songURL" : musicURL
            }
            result.songs.push(newSong)
        
            //console.log(result)
            fs.writeFile("songs.json",JSON.stringify(result),err=>{
                //err check
                if(err) throw err;

                msg.channel.send('成功在最愛清單加入此音樂');
                //console.log("Add Done")
            })
        })
    }

    async removeSongs(msg) {
        // 處理字串，將 ##remove 字串拿掉，只留下 YouTube 網址
        const musicURL = msg.content.replace(`${prefix}remove`, '').trim();

        var fs=require('fs');
        var file="songs.json";
        fs.readFile(file,function(err,data){
            var result = JSON.parse(data)
            for(var url in result.songs){
                if (result.songs[url]['songURL'] === musicURL) {
                    result.songs.splice(url,1);
                    break
                }
                else{
                    //pass
                }
            }

            console.log(result)
            fs.writeFile("songs.json",JSON.stringify(result, null , '\t'),err=>{
                //err check
                if(err) throw err;

                msg.channel.send('成功在最愛清單刪除這首音樂');
                //console.log("Remove Done")
            })
        })
    }

    leave(msg) {

        // 如果機器人在頻道中
        if (this.connection[msg.guild.id] && this.connection[msg.guild.id].status === 0) {

            // 如果機器人有播放過歌曲
            if (this.queue.hasOwnProperty(msg.guild.id)) {

                // 清空播放列表
                delete this.queue[msg.guild.id];

                // 改變 isPlaying 狀態為 false
                this.isPlaying[msg.guild.id] = false;
            }

            // 離開頻道
            this.connection[msg.guild.id].disconnect();
        } else {
            msg.channel.send('機器人未加入任何頻道');
        }

    }

    async imgSearch(msg) {
        // 處理字串，將 ##img 字串拿掉，只留下關鍵字
        const searchStr = msg.content.replace(`${prefix}img`, '').trim();
        //console.log(searchStr)

        try {
            msg.channel.send('正在搜尋「'+searchStr+"」相關圖片");
            //let page = await browser.newPage();
            //await page.setViewport({width: 1440, height: 900});
            //await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchStr)}&tbm=isch`)
            //let screenshot = await page.screenshot({type: 'png'});
            //message.channel.send(new Discord.Attachment(screenshot, "screenshot.png"));
            //await page.close();
            const results = await google.scrape(searchStr,3)
            results.forEach( function(x) {
                msg.channel.send(x.url);
            });
        } 
        catch(e) {
            console.log(e);
        }
    }

    async googleSearch(msg) {
        const searchStr = msg.content.replace(`${prefix}google`, '').trim();
        googleIt({'query': searchStr}).then(results => {
            var counter = 0;
            for(let i=0 ; i<5; i++)
            {
                msg.channel.send(results[i]['title']+'\n'+results[i]['link']+'\n'+results[i]['snippet']+'\n');
            }
          }).catch(e => {
            console.log(e)
          })
    }

    async tfidf(msg) {
        const text = msg.content.replace(`${prefix}key`, '').trim();
        const topN = 10;
        try
        {
            jieba.load('zh_TW_dict.txt')
            var jiebaKey = jieba.extract(text,topN)
            var output = '你廢話太多，我幫你找出重點了:\n'
            jiebaKey.forEach(i=>{
                output += i['word']+'\n'
            })
            msg.channel.send(output);
        }
        catch(e)
        {
            console.log(e)
        }
    }

    async wordCloud(msg){
        const text = msg.content.replace(`${prefix}cloud`, '').trim();
        let {PythonShell} = require('python-shell');

        let options = {
            mode: 'text',
            pythonPath: 'C:/ProgramData/Anaconda3/python.exe',
            pythonOptions: ['-u'], // get print results in real-time
            args: [text]
        };

        PythonShell.run('PTT_wordcloud.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            //console.log('results: %j', results);
            console.log('generate picture success')
            msg.channel.send({files:["output_wordcloud.png"]});
        });
    }

    async Quiz(msg){
        var fs=require('fs');
        var file="AnimeQ.json";
        fs.readFile(file,'utf-8',function(err,data){
            let quizData = JSON.parse(data)
            //console.log(quizData);

            var output = quizQueue.filter(function(value){ return value.username===msg.author.username;});
    
            if(output[0]!==undefined)
            {
                let userQuiz = quizData[output[0].index];
                msg.channel.send(
                    `${msg.author.username} 你好, 這是你的題目:\n`+
                    `原始出處: ${userQuiz.Original}\n`+
                    `性別: ${userQuiz.Gender}\n`+
                    `類別: ${userQuiz.Type}\n`+
                    `角色特色: ${userQuiz.feature}\n`+
                    `其他提示: ${userQuiz.other_tip.join(', ')}\n`+
                    `(注意猜題時若為英文名請全數輸入小寫英文字母)`
                );
            }
            else
            {
                let index = Math.floor(Math.random()*quizData.length);
                quizQueue.push({"username":msg.author.username,"index":index});
                msg.channel.send(`${msg.author.username} 初始化題目完成，請在執行一次`);
                console.log(quizQueue);
            }
        });
    }

    async QuizAnswer(msg)
    {
        const answer = msg.content.replace(`${prefix}ans`, '').trim();
        console.log(answer);
        var fs=require('fs');
        var file="AnimeQ.json";
        fs.readFile(file,'utf-8',function(err,data){
            let quizData = JSON.parse(data)
            var output = quizQueue.filter(function(value){ return value.username===msg.author.username;});
    
            if(output[0]!==undefined)
            {
                let userAnswer = quizData[output[0].index].Name;
                if(answer === userAnswer)
                {
                    quizQueue = quizQueue.filter(function(value){ return value.username !== msg.author.username; });
                    msg.channel.send(`${msg.author.username}  恭喜你答對了!答案是: ${userAnswer}\n(清除題目完畢，現在可以重新申請題目)`);
                    console.log('RightAnswer '+quizQueue);
                }
                else
                {
                    msg.channel.send(`${msg.author.username} 答錯了餒，再試一次? 或輸入「endquiz」結束題目。`);
                }
            }
            else
            {
                msg.channel.send(`${msg.author.username} 尚未有題目!請先向PBOT申請題目!`);
            }
        });
    }

    async clearQuiz(msg)
    {
        var fs=require('fs');
        var file="AnimeQ.json";
        fs.readFile(file,'utf-8',function(err,data){
            let quizData = JSON.parse(data)
            var output = quizQueue.filter(function(value){ return value.username===msg.author.username;});
    
            if(output[0]!==undefined)
            {
                let userAnswer = quizData[output[0].index].Name;
                quizQueue = quizQueue.filter(function(value){ return value.username !== msg.author.username; });
                msg.channel.send(`${msg.author.username} 你目前的答案是: ${userAnswer}。清除題目完畢，現在可以重新申請題目`);
                console.log('clearQuiz '+quizQueue);
            }
            else
            {
                msg.channel.send(`${msg.author.username} 尚未有題目!不用清除現有題目`);
            }
        });
    }
}

// run class Music
const pbot = new PBot();

// 當 Bot 接收到訊息時的事件
client.on('message', async (msg) => {

   
    // 如果發送訊息的地方不是語音群（可能是私人），就 return
    if (!msg.guild) return;

    // !!join
    if (msg.content === `${prefix}join`) {

        // 機器人加入語音頻道
        pbot.join(msg);
        
    }

    // !!play
    // 如果使用者輸入的內容中包含 play
    if (msg.content.indexOf(`${prefix}play`) > -1) {

        // 如果使用者在語音頻道中
        if (msg.member.voice.channel) {

            // 播放音樂
            await pbot.play(msg);
        } else {

            // 如果使用者不在任何一個語音頻道
            msg.reply('你必須先加入語音頻道');
        }
    }

    // !!resume
    if (msg.content === `${prefix}resume`) {

        // 恢復音樂
        pbot.resume(msg);
    }

    // !!pause
    if (msg.content === `${prefix}pause`) {

        // 暫停音樂
        pbot.pause(msg);
    }

    // !!skip
    if (msg.content === `${prefix}skip`) {

        // 跳過音樂
        pbot.skip(msg);
    }

    // !!queue
    if (msg.content === `${prefix}queue`) {

        // 查看隊列
        pbot.nowQueue(msg);
    }

    // !!leave
    if (msg.content === `${prefix}leave`) {

        // 機器人離開頻道
        pbot.leave(msg);
    }

    // !!img search
    if (msg.content.indexOf(`${prefix}img`) > -1) {

        //機器人google搜圖
        await pbot.imgSearch(msg);
    }

    // !!google search
    if (msg.content.indexOf(`${prefix}google`) > -1) {

        //機器人google文章
        await pbot.googleSearch(msg);
    }

    // !!tf-idf word analyze
    if (msg.content.indexOf(`${prefix}key`) > -1) {
        //機器人google文章
        await pbot.tfidf(msg);
    }

    // !!load all url from local json file
    if (msg.content === `${prefix}load`) {

        //機器人讀取本機songs.json
        await pbot.loadSongs(msg);
    }

    // !!add url to local json file
    if (msg.content.indexOf(`${prefix}add`) > -1) {
        //console.log("add songs")
        //機器人讀取本機songs.json
        await pbot.addSongs(msg);
    }

    // !!remove url from local json file
    if (msg.content.indexOf(`${prefix}remove`) > -1) {
        //console.log("Remove songs")
        //機器人讀取本機songs.json
        await pbot.removeSongs(msg);
    }

    // !!remove url from local json file
    if (msg.content.indexOf(`${prefix}cloud`) > -1) {
        //機器人製作文字雲照片
        await pbot.wordCloud(msg);
    }

    if (msg.content === `${prefix}quiz`) {
        // 動漫猜題--問題目
        await pbot.Quiz(msg);
    }

    if (msg.content.indexOf(`${prefix}ans`) > -1) {
        //動漫猜題--猜答案
        await pbot.QuizAnswer(msg);
    }

    if (msg.content.indexOf(`${prefix}end_quiz`) > -1) {
        //動漫猜題--結束問題
        await pbot.clearQuiz(msg);
    }

    // !!user guide
    if (msg.content === `${prefix}help`){
        msg.reply('\n`join`: BOT加入伺服器\n'+
        '`leave`: BOT離開伺服器\n'+
        '`play {youtube 連結}`: 播放Youtube歌曲\n'+
        '`pause`: 暫停目前的歌曲\n'+
        '`resume`: 繼續播放目前的歌曲\n'+
        '`queue`: 查看播放清單\n'+
        '`load`: 回傳所有在BOT端儲存的最愛清單連結\n'+
        '`add {youtube 連結}`: 在BOT端最愛清單新增音樂\n'+
        '`remove {youtube 連結}`: 在BOT端最愛清單刪除這首音樂\n'+
        '`img {搜尋標籤 (用空白隔開)}`: Google搜尋圖片(目前設定為一次最相關3張)\n'+
        '`google {搜尋內容}`: Google搜尋(目前設定為一次最相關5則)\n'+
        '`key {文章內文}`: 使用TF/IDF(文本/逆文本分析)進行文章分析，找出關鍵字(目前設定為分析數值最重要之10個字詞)\n'+
        '`cloud {PTT文章內文}`: 製作PTT文章之留言文字雲圖像\n'+
        '`quiz`: 動漫猜題初始話與繼續\n'+
        '`ans {猜答案}`: 動漫猜題猜答案\n'+
        '`end_quiz`: 清除你的動漫猜題\n'
        );
    }
});

client.login(token);