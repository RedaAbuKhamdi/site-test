/**
 * Created by Vladislav on 27.09.2024.
 */

const fs = require("fs-extra");
const path = require("path");
const https = require("https");

const localizationPath = path.join(process.cwd(), "localization");
const assetsPath = "assets";

const languageNames = {
    "en": "English",
    "de": "Deutsche",
    "es": "Español",
    "fr": "Français",
    "it": "Italiano",
    "ja": "日本語",
    "ko": "한국어",
    "lv": "Latvijas",
    "nl": "Nederlands",
    "pl": "Polskie",
    "pt": "Português",
    "ru": "Русский",
    "tr": "Türkçe",
    "ar": "عربى",
    "zh": "中文",
};

const generateLogo = (result) => {
    const sourcePath = "cleverapps/res/logo/cleverapps_logo.png";

    const logoAssetPath = "logo.png";

    fs.copyFileSync(sourcePath, path.join(assetsPath, logoAssetPath));

    result.logo = logoAssetPath;
};


const addKey = (key, value, result) => {
    const parts = key.split(".");
    let obj = result;
    parts.forEach((part, index)=> {
        if (index === parts.length - 1) {
            obj[part] = value;
        } else {
            if (!obj[part]) {
                obj[part] = {};
            }

            obj = obj[part];
        }
    });
};
const getHtml = async (links) => Promise.all(
    Object.keys(links).map((linkName) => new Promise((resolve) => {

    const link = links[linkName];

    let data = "";
    https.get(link, (response) => {
        response.on("data", function (chunk) {
            data += chunk;
        });
        response.on("end", function () {
            links[linkName] = data;

            resolve(data);
        });
    });
})));

const addCommonData = async (result, commonData) => {
    Object.assign(result, commonData);

    await getHtml(result.footer_links);

    fs.readdirSync(localizationPath).forEach(filename => {
        if (filename.includes("cache")) {
            return;
        }
        const data = fs.readJsonSync(path.join(localizationPath, filename));

        const language = path.parse(filename).name;

        for (let key in data) {
            addKey(`${key}.${language}`, data[key], result);
        }
    });

    result.languages = languageNames;

    generateLogo(result);

    return result;
};

module.exports = addCommonData;