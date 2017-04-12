const cheerio = require('cheerio')
const fs = require('fs');
const moment = require('moment')
const jsonfile = require('jsonfile')

const html =fs.readFileSync('test.html', 'utf8').replace(/\\/g, '')

const $ = cheerio.load(html)

var blockpnr= $('.block-pnr').map(function(i, el){
    return $(this).children().children().first().text()
  })

function parseDate(dateParts)
{
  let date = new Date(dateParts[2], dateParts[1]-1, dateParts[0])
  return moment(date).format("YYYY-MM-DD HH:mm:ss")+".000Z";
}
function date(param)
{
  let regex = /[0-3]\d\/[0-1]\d\/\d\d\d\d/g;
  switch(param){
    case 0:
    return parseDate(blockpnr.get(0).match(regex)[0].split('/'))
    break;
    case 1:
    return parseDate(blockpnr.get(0).match(regex)[1].split('/'))
    break;
    case 2:
    return parseDate(blockpnr.get(1).match(regex)[0].split('/'))
    break;
    case 3:
    return parseDate(blockpnr.get(1).match(regex)[1].split('/'))
    break;
  }

}
function roundTrips() {
  let arr = [];
$('.product-details').each(function(index, element){
  let trainInfos =  { "departureTime": $(this).find('.origin-destination-hour').first().text().replace('h',':').trim(),
    "departureStation": $(this).find('.origin-destination-station').first().text().trim(),
    "arrivalTime": $(this).find('.origin-destination-hour').last().text().replace('h',':').trim(),
    "arrivalStation": $(this).find('.origin-destination-station').last().text().trim(),
    "type": $(this).children().children().children().eq(3).text().trim(),
    "number": $(this).children().children().children().eq(4).text().trim()};
    if (index ==3)
    {
      trainInfos.passengers = [ ];
      $('.typology').each(function(i,el){
      if (i < 4) {
      trainInfos.passengers.push({
        "type": "échangeable",
        "age":"("+$(this).text().split('(')[1].trim()
      })
      }
      })
    }
    arr.push({
      "type": $(this).find('.travel-way').text().trim(),
      "date": date(index),
      "trains": [ trainInfos ]})
   });
   return arr;
}

var JSON = {"status": "ok",
"result":{
  "trips": [{
    "code": "TODO",
    "name": "TODO",
    "details": {
      "price": "todo",
  "roundTrips": roundTrips()}}],
  "custom": {}
} }

jsonfile.writeFile('result.json',JSON ,{spaces: 2},function (err) {
  if(err) console.error(err)
  console.log('Email has been scraped')
})
// console.log($('.block-pnr').children().children().first())
