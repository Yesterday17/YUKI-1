SESSION_URL = "https://fanyi-api.baidu.com/"
TRANSLATE_URL =
    "https://fanyi-api.baidu.com/api/trans/vip/translate"
USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36"

var appid = '123456';  // 从 https://api.fanyi.baidu.com/ 获取
var key = 'abcdefg'; // 从 https://api.fanyi.baidu.com/ 获取

var requestTranslation;
var from = 'auto';
var to = 'zh';

requestTranslation = () => {
    var salt = Date.now();
    var str1 = appid + text + salt + key;
    var sign = md5(str1);

    const url = new URL(TRANSLATE_URL);
    url.search = {
        q: text,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
    }
    return fetch(url, {
        headers: {
            Referer: SESSION_URL,
            "User-Agent": USER_AGENT
        },
    }).then(data => data.json())
        .then(sentences => {
            if (sentences.trans_result) {
                sentences = sentences.trans_result;
                let result = "";
                for (let i in sentences) {
                    result += sentences[i].dst;
                }
                resolve(result);
            } else {
                reject(
                    `Error. Raw result: ${body}`
                );
            }
        }).catch(err => {
            reject(err);
        });
};
requestTranslation();