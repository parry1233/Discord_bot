let {PythonShell} = require('python-shell');

let options = {
  mode: 'text',
  pythonPath: 'C:/ProgramData/Anaconda3/python.exe',
  pythonOptions: ['-u'], // get print results in real-time
  args: ['https://www.ptt.cc/bbs/Stock/M.1623911024.A.9DE.html']
};

PythonShell.run('PTT_wordcloud.py', options, function (err, results) {
  if (err) throw err;
  // results is an array consisting of messages collected during execution
  //console.log('results: %j', results);
  console.log('generate picture success')
});
