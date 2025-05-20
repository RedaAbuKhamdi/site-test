/**
 * Created by vladislav on 16.03.2022
 */

const fs = require("fs-extra");
const path = require("path");

const addCommonData = require("./addcommondata");
const addProjectData = require("./addprojectdata");
const generateScreenshots = require("./generatescreenshots");
const Context = require("../cleverapps/common/context");

const portalJsonPath = "portal.json";

const commonDataPath = path.join(process.cwd(), "common_data.json");

const languages = ["en", "de", "ru", "es", "fr", "it", "ja", "nl", "pt", "ar", "ko", "tr", "zh", "pl", "lv"];

const writePortalJson = (data) => {
    fs.writeJsonSync(portalJsonPath, data, {
        spaces: "\t"
    });
};

var run = async () => {
    const result = {};

    const commonData = fs.readJsonSync(commonDataPath);

    const projects = commonData.projects;
    delete commonData.projects;

    await addCommonData(result, commonData);

    result.games = {};
    for (const project of projects) {
        console.log(`Processing ${project}...`);
        
        try {
        const cwd = process.cwd();

        process.chdir(path.resolve("../", project));

        const ScriptHelper = require("../cleverapps/common/scripthelper");

        ScriptHelper.initializeScriptContext("release");

        const context = Context.getContext();

        process.chdir(cwd);

        addProjectData(project, result.games, languages, context);

        generateScreenshots(project, result.games, languages);
        } 
        catch (e) {
        }
    }

    writePortalJson(result);

    console.log(`Done`);
};

void run();
