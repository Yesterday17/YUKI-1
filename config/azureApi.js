AZURE_TRANSLATION_URL = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=zh-Hans&from=ja";
// Get a key at Azure, free 2 million words / month
SUBSCRIPTION_KEY = "5ce850af5f37474c91e6911ca36ddc24";

requestTranslation = () => {
  return fetch(AZURE_TRANSLATION_URL, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
    },
    body: JSON.stringify({ Text: text })
  }).then(data => data.json())
    .then(json => {
      if (json.error) {
        reject(`Error: ${json.error.message}`);
      } else {
        var result = json[0].translations[0].text;
        resolve(result);
      }
    }).catch(err => {
      reject(`error: ${err}`);
    })
}
requestTranslation();