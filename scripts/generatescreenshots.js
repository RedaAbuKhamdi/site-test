/**
 * Created by Vladislav on 27.09.2024.
 */
const fs = require("fs-extra");
const path = require("path");
const {execSync} = require("child_process");
const digest = require("../cleverapps/common/digest");
const ScriptHelper = require("../cleverapps/common/scripthelper");

const assetsFolder = path.join(process.cwd(), "assets");

const screenshots = [
    {
        propName: "screenshots",
        size: "913x540",
        source: ["fb_1920x1080", "fb_1218x720"]
    },
    {
        propName: "screenshots/minimal",
        size: "508x300",
        source: ["fb_1920x1080", "fb_1218x720"]
    },
    {
        propName: "screenshots",
        size: "960x540",
        source: ["fb_1920x1080", "fb_1218x720"]
    },
    {
        propName: "screenshots/minimal",
        size: "533x300",
        source: ["fb_1920x1080", "fb_1218x720"]
    },
    {
        propName: "screenshots_portrait",
        size: "617x1344",
        source: ["iphone_2208x1242", "iphone_1242x2208", "iphonex_1284x2778"]
    },
    {
        propName: "screenshots_portrait/minimal",
        size: "343x747",
        source: ["iphone_2208x1242", "iphone_1242x2208", "iphonex_1284x2778"]
    },
    {
        propName: "screenshots_portrait",
        size: "617x1344",
        source: ["iphone_2208x1242", "iphone_1242x2208", "iphonex_1284x2778"]
    },
    {
        propName: "screenshots_portrait/minimal",
        size: "343x747",
        source: ["iphone_2208x1242", "iphone_1242x2208", "iphonex_1284x2778"]
    }
];

const generateScreenshots = (name, result, languages, settings) => {
    var screenshots = result[settings.propName] = {};

    var sources = settings.source;
    if (!Array.isArray(sources)) {
        sources = [sources];
    }

    let sourcePath = sources
        .map(source => path.resolve(process.cwd(), "..", name, "promo/icons/screenshots", source))
        .find(sourcePath => fs.existsSync(sourcePath));

    if (!sourcePath) {
        console.log(`Not found ${sources.join(", ")}`);
        return;
    }

    languages.forEach((language) => {
        screenshots[language] = [];

        if (!fs.existsSync(assetsFolder)) {
            fs.mkdirSync(assetsFolder);
        }

        const languagePath = path.join(sourcePath, language);

        if (!fs.existsSync(languagePath)) {
            return;
        }

        fs.readdirSync(languagePath).forEach((fileName, index) => {
            const screenshotName = `${name}_${index}_${language}.jpg`;

            const targetPath = path.join(assetsFolder, settings.propName);
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath);
            }

            const source = path.resolve(languagePath, fileName);

            const target = path.resolve(targetPath, screenshotName);

            const oldDigest = digest.read(target);
            const newDigest = digest.calc(source);

            if (oldDigest !== newDigest) {
                execSync(`convert ${source} -resize ${settings.size} ${target}`);
            }

            screenshots[language].push(ScriptHelper.windowsToPosixPath(path.join(settings.propName, screenshotName)));

            if (oldDigest !== newDigest) {
                digest.write(targetPath, newDigest, screenshotName);
            }
        });
    });
};

const generateBanners = (projectName, result) => {
    result.banners = {};

    const generateBanner = (sources, name, fieldName, resize) => {
        if (!Array.isArray(sources)) {
            sources = [sources];
        }

        let sourcePath;
        for (let i = 0; i < sources.length; i++) {
            sourcePath = path.resolve(process.cwd(), "..", projectName, sources[i]);

            if (fs.existsSync(sourcePath)) {
                break;
            }
        }

        name = name.replace("${projectName}", projectName);
        const assetPath = path.join("banners", name + ".jpg");
        const targetPath = path.join(assetsFolder, assetPath);

        execSync(`convert ${sourcePath} -resize ${resize} ${targetPath}`);

        result.banners[fieldName] = ScriptHelper.windowsToPosixPath(assetPath);
    };
    generateBanner(["promo/icons/banner_1920x1080.jpg", "promo/icons/banner_1120x630.jpg"], "${projectName}", "banner", "50%");
    generateBanner("promo/instant/banner_1600x300.jpg", "${projectName}_wide", "banner_wide", "100%");
    generateBanner("promo/icons/icon_1024.png", "${projectName}_promo", "banner_promo", "20%");
};

const generatePreviewVideos = (projectName, result) => {
    result.preview = {};

    const generatePreviewVideo = (sources, name, fieldName) => {
        if (!Array.isArray(sources)) {
            sources = [sources];
        }

        let sourcePath;
        for (let i = 0; i < sources.length; i++) {
            sourcePath = path.resolve(process.cwd(), "..", projectName, sources[i]);

            if (fs.existsSync(sourcePath)) {
                break;
            }
        }

        name = name.replace("${projectName}", projectName);
        const assetPath = path.join("previews", name + ".mp4");
        const targetPath = path.join(assetsFolder, assetPath);

        execSync(`cp ${sourcePath} ${targetPath}`);

        result[fieldName] = ScriptHelper.windowsToPosixPath(assetPath);
    };
    generatePreviewVideo(["promo/icons/videos/landscape/preview_1920x1080.mp4", "promo/icons/videos/landscape/preview_en_1920x1080.mp4"], "${projectName}", "preview");
};

const generate = (project, result, languages) => {
    screenshots.forEach((settings) => generateScreenshots(project, result[project], languages, settings));

    generatePreviewVideos(project, result[project]);
    generateBanners(project, result[project]);
};

module.exports = generate;