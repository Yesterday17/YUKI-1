var JWT_GENERATE_URL =
  "https://api.interpreter.caiyunai.com/v1/user/jwt/generate";
var TRANSLATE_URL = "https://api.interpreter.caiyunai.com/v1/translator";
var ORIGIN_URL = "https://fanyi.caiyunapp.com";
var USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36";
var AUTH_TOKEN = "token:qgemv4jr1y38jyq6vhvi";

////////////////////////////////////////////////////////

var jwt;
var browserId;

if (!browserId) {
  browserId = randomBrowserId();
}

jwtCheck()
  .then(() => translate())
  .catch((e) => reject(`error: ${e}`));

////////////////////////////////////////////////////////

function jwtCheck() {
  if (
    !jwt ||
    JSON.parse(Buffer.from(jwt.split(".")[1], "base64")).exp < Date.now / 1000
  ) {
    return renewJWT().then((t) => (jwt = t));
  } else {
    return Promise.resolve();
  }
}

function renewJWT() {
  return fetch(JWT_GENERATE_URL, {
    method: 'POST',
    headers: {
      Origin: ORIGIN_URL,
      Referer: ORIGIN_URL,
      "User-Agent": USER_AGENT,
      "X-Authorization": AUTH_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      browser_id: browserId,
    }),
  }).then(data => data.json()).then((j) => j.jwt);
}

async function translate() {
  const data = await fetch(TRANSLATE_URL, {
    method: 'POST',
    headers: {
      Origin: ORIGIN_URL,
      Referer: ORIGIN_URL,
      "T-Authorization": jwt,
      "X-Authorization": AUTH_TOKEN,
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      source: text,
      trans_type: "ja2zh",
      request_id: "web_fanyi",
      media: "text",
      os_type: "web",
      dict: false,
      cached: false,
      replaced: true,
      browser_id: browserId,
    }),
  });
  const json = await data.json();
  if (json.target) {
    resolve(decrypt(json.target));
  } else {
    browserId = randomBrowserId();
    jwt = undefined;
  }
}

////////////////////////////////////////////////////////

function randomBrowserId() {
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  var result = "";
  for (var i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function rocn(str, n = 13) {
  return str.replace(/[a-zA-Z]/g, function (c) {
    return String.fromCharCode(
      (c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + n) ? c : c - 26
    );
  });
}

function decrypt(str) {
  return Buffer.from(rocn(str), "base64").toString("utf-8");
}
