const { Console } = require('console')
const  googleIt = require('google-it')
const nodejieba = require('nodejieba')
var search = '現在幾點'
const topN = 10
var loadStr = ''


googleIt({'query': search}).then(results => {
  // access to results object here
  results.forEach(r => {
      //console.log(r['title'])
      //console.log(r['snippet'])
      loadStr += ' '+r['snippet']
  });

  console.log(loadStr)
  nodejieba.load('zh_TW_dict.txt')
  tfIdf = nodejieba.extract(search,topN)
  console.log(tfIdf)
  var list = []
  tfIdf.forEach(i=>{
      list.push([i['word'],i['weight']])
  })
  console.log(list)

}).catch(e => {
  // any possible errors that might have occurred (like no Internet connection)
  //console.log(e)
})

