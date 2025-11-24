import fs from 'fs';
import path from 'path';

function setupExecutor() {
    const executorInfo = {
        name: "Node.js",
        type: "nodejs",
        buildName: process.env.npm_package_name,
        buildUrl: process.env.CI_BUILD_URL || "",
        reportUrl: process.env.CI_REPORT_URL || "",
        reportName: "Allure Report",
        nodeVersion: process.version
    };

    const allureResultsDir = 'allure-results';
    
    if (!fs.existsSync(allureResultsDir)) {
        fs.mkdirSync(allureResultsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(allureResultsDir, 'executor.json'),
        JSON.stringify(executorInfo, null, 2)
    );
}

export { setupExecutor }; 