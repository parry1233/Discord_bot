let quizQueue = [];

function Quiz(username)
{
    var fs=require('fs');
    var file="AnimeQ.json";
    fs.readFile(file,'utf-8',function(err,data){
        let quizData = JSON.parse(data)
        //console.log(quizData);

        var output = quizQueue.filter(function(value){ return value.username===username;});
    
        if(output[0]!==undefined)
        {
            let userQuiz = quizData[output[0].index];
            console.log(
                `用戶 ${username} 你好, 這是你的問題:\n`+
                `原始出處: ${userQuiz.Original}\n`+
                `性別: ${userQuiz.Gender}\n`+
                `類別: ${userQuiz.Type}\n`+
                `角色特色: ${userQuiz.feature}\n`+
                `其他提示: ${userQuiz.other_tip.join(', ')}`
            );
        }
        else
        {
            console.log(`${username} Add to QuizQueue`);
            console.log(quizQueue);
            let index = Math.floor(Math.random()*quizData.length);
            quizQueue.push({"username":username,"index":index});
            Quiz(username);
        }
    })
}

function Answer(username,answer)
{
    console.log(quizQueue);
    var fs=require('fs');
    var file="AnimeQ.json";
    fs.readFile(file,'utf-8',function(err,data){
        let quizData = JSON.parse(data)
        var output = quizQueue.filter(function(value){ return value.username===username;});
    
        if(output[0]!==undefined)
        {
            let userAnswer = quizData[output[0].index].Name;
            if(answer === userAnswer)
            {
                console.log("Right Answer! Answer is "+userAnswer);
                console.log(quizQueue);
                quizQueue = quizQueue.filter(function(value){ return value.username !== username; });
                console.log(quizQueue);    
            }
            else
            {
                console.log("Wrong Answer!");
            }
        }
        else
        {
            console.log(`用戶 ${username} 尚未有題目!請先向PBOT申請題目!`);
        }
    })
}

Quiz("parry1233");
Quiz("lol");
Answer("parry1233","一條樂");
Quiz("1111");
Answer("1111","Vivy");