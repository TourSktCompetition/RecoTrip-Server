var async = require('async');
var request = require('request');
var utf8 = require('utf8');


var tourAPIServiceKey = "9%2B2%2FWeYF07eBbB%2FUcDPtAvlfr6DyVNFsPLXLVcvPkQjD2f45OIYvkraOdQhOUOaZDuJzbNxrdxhDmqoFzNqSrA%3D%3D";
var tourAPIBaseURL = "http://api.visitkorea.or.kr/openapi/service/rest/KorService/";

var googlePlaceAPIBaseURL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
var googlePlaceAPIServiceKey = "AIzaSyDePFnC4_tAylyWPLA4LEKC358Jcqx4V2k";
// var query=신사동 가로수길&key=AIzaSyDePFnC4_tAylyWPLA4LEKC358Jcqx4V2k

exports.list = function(req, res, next) {
    async.waterfall([
            function(callback) {
                var requestURL = tourAPIBaseURL + req.params.type + "?serviceKey=" + tourAPIServiceKey + "&pageNo=" + req.params.page +
                    "&numOfRows=2&MobileApp=Reco&MobileOS=ETC&arrange=B&cat1=A02&contentTypeId=12&areaCode=1&listYN=Y&_type=json";

                request(requestURL,
                    function(error, response, body) {
                        if (error) {
                            callback(error)
                        } else {
                            var jsonText = JSON.parse(body);
                            var resultArr = [];
                            var itemArr = jsonText.response.body.items.item;
                            for (var idx in itemArr) {
                                resultArr.push(itemArr[idx].title);
                            }
                            callback(null, resultArr);
                        }
                    });
            },
            function(titles, callback) {
                var resultArr = [];
                var requestURLArr = [];
                console.log(titles);
                for (var idx in titles) {
                    requestURLArr.push(googlePlaceAPIBaseURL + "?query=" + utf8.encode(titles[idx]) + "&key=" + googlePlaceAPIServiceKey);
                }
                async.map(requestURLArr,

                    function(url, callback) {
                        console.log(url);
                        request(url,
                            function(error, response, body) {
                                if (error) {
                                    callback(error);
                                } else {
                                    var jsonBody = JSON.parse(body);
                                    jsonBody = jsonBody.results[0];
                                    var result = {
                                        name: jsonBody.name,
                                        addr: jsonBody.formatted_address,
                                        placeId: jsonBody.place_id,
                                        rating: jsonBody.rating,
                                    }
                                    callback(null, result);
                                }
                            });
                    },
                    function(err, results) {
                        if (err) {
                            callback(err)
                        } else {
                            console.log(results);
                            callback(null, results);
                        }
                    });
            }
        ],
        function(err, result) {
            if (err) {
                res.json({
                    "result": "ERR",
                    "message": result
                });
            } else {
                res.json(result);
            }
        });
};
/*
var uuid = require('uuid');
var arr  = [1,2,3,4,5];
async.map(arr,
    function(item, callback){   // 배열의 1~5까지 id와 uuid를발급하여 키밸류 생성
        var uuidArr = [];
        var count = 0;
        async.whilst(function() {
            return count < 3;   // 반복조건 명시
        },function(callback){
            count++;
            uuidArr.push(uuid.v4());    // uuidArr 배열에 uuid값 한개추가 ---> whilst함수로 3번 반복
            callback();
        },function(err){
            if(!err) callback(null, {id:item, uuid:uuidArr});
            // 에러가 없다면 결과를 하단의 콜백함수의 result 매개변수로 전달한다. 아래의 콜백에서 실제 출력 진행
        })

    },
    function(err,result){
        if(err) console.log(err);
        else console.log(result);
    }
);
*/
