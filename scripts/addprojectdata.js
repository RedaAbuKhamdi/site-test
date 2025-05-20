/**
 * Created by Vladislav on 27.09.2024.
 */

const fs = require("fs-extra");
const path = require("path");

const guessPlatformUrl = require("../connector/guessplatformurl");

const descriptionMap = {
    extTitle: "title_short",
    info: "info",
    cta: "cta",
    bonus: "bonus",
    longTitle: "title_long",
    description: "tagline"
};

const platforms = [
    "xsolla",
    "instant",
    "android",
    "ios",
    "amazon",
    "macos",
    "microsoft",
    "ok",
    "vk",
    "mm",
    "yandex",
    "rustore",
    "mbga",
    "draugiem",
];

const addLinks = (project, config, result) => {
    result.links = {};

    for (const platform of platforms) {
        result.links[platform] = guessPlatformUrl({
            config: config,
            source: platform,
            isMobile: false,
            debugMode: false,
            isPlayhop: false
        });
    }
};

const addCommonDescription = (project, result) => {
    const descriptionJsonPath = path.join("../", project, `locales/description.common.json`);

    if (!fs.existsSync(descriptionJsonPath)) {
        console.log(`Not found ${descriptionJsonPath}`);
        return;
    }

    const descriptionJson = fs.readJsonSync(descriptionJsonPath);

    for (let key of ["video", "category"]) {
        result[key] = descriptionJson[key];
    }

    switch (result.category){
        case "merge":
            result.genre = "strategy";
            break;
        case "word":
            result.genre = "educational";
            break;
        case "card":
            result.genre = "cards";
            break;
        case "puzzle":
        case "differences":
            result.genre = "puzzles";
            break;
        default:
            result.genre = result.category;
    }

};

const addFromDescription  = (project, result, language) => {
    const descriptionJsonPath = path.join("../", project, `locales/description.${language}.json`);

    if (!fs.existsSync(descriptionJsonPath)) {
        console.log(`Not found ${descriptionJsonPath}`);
        return;
    }

    const descriptionJson = fs.readJsonSync(descriptionJsonPath);

    for (let descKey in descriptionMap) {
        const portalKey = descriptionMap[descKey];

        if (!result[portalKey]) {
            result[portalKey] = {};
        }
        result[portalKey][language] = descriptionJson[descKey];
    }
};

const parseLinesToSentences = (lines) => {
    const terminators = [".", "?", "!", "。", "？", "！"];
    let sentences = [];

    let order = 0;
    for (let line of lines) {
        let index = 0;
        for (let i = 0; i < line.length; i++) {
            if (terminators.includes(line[i])) {
                sentences.push({
                    string: line.substring(index, i + 1).trim(),
                    order: order + index
                });

                index = i + 2;
            }
        }

        order += line.length;
    }

    sentences.sort((s1, s2) => s2.string.length - s1.string.length);

    sentences = sentences.slice(0, 2);

    sentences.sort((s1, s2) => s1.order - s2.order);

    return sentences.map(sentence => sentence.string);
};

const addFromReadme  = (project, result, language) => {
    const localization = fs.readJsonSync(path.join("localization", `${language}.json`));

    const featuresString = localization["features_title"];

    const readmePath = path.join("../", project, `locales/README.${language}.md`);

    if (!fs.existsSync(readmePath)) {
        console.log(`Not found ${readmePath}`);
        return;
    }

    const readme = fs.readFileSync(readmePath, "utf8");

    let lines = readme.split("\r\n").join("\n").split("\r").join("\n").split("\n");

    const featureLines = lines.filter(line => line.startsWith("•"));
    if (!result["features_list"]) {
        result["features_list"] = {};
    }
    result["features_list"][language] = [];
    for (let line of featureLines) {
        result["features_list"][language].push(line.slice(1).trim());
    }

    lines = lines.filter(line => line !== "" && !line.startsWith("#") && !line.startsWith("•"));

    const featuresLine = lines.find(line => line.includes(featuresString));
    const index = lines.indexOf(featuresLine);

    const linesBefore = lines.slice(0, index);
    const linesAfter = lines.slice(index + 1);

    const sentencesBefore = parseLinesToSentences(linesBefore);
    const sentencesAfter = parseLinesToSentences(linesAfter);

    if (!result.description_text_1) {
        result.description_text_1 = {};
    }
    if (!result.description_text_2) {
        result.description_text_2 = {};
    }
    result.description_text_1[language] = sentencesBefore.join(" ");
    result.description_text_2[language] = sentencesAfter.join(" ");
};

const addProjectData = (project, result, languages, context) => {
    result[project] = {};

    for (let language of languages) {
        addFromDescription(project, result[project], language);

        addFromReadme(project, result[project], language);
    }

    addCommonDescription(project, result[project]);

    addLinks(project, context.configData, result[project]);
}

module.exports = addProjectData;