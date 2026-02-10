#!/usr/bin/env node

// Copyright (c) 2026, Antoine Duval
// This file is part of a source-visible project.
// See LICENSE for terms. Unauthorized use is prohibited.

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '../angular/src/assets/i18n');

function getAllKeys(obj, prefix = '') {
    const keys = [];

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null) {
            keys.push(...getAllKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys.sort();
}

function validateTranslations() {
    const files = fs
        .readdirSync(I18N_DIR)
        .filter((file) => file.endsWith('.json'));

    if (files.length === 0) {
        console.error('❌ No translation files found');
        process.exit(1);
    }

    console.log(`🔍 Validating ${files.length} translation files...`);

    const translationData = {};
    const allKeySets = {};

    // Read all translation files
    for (const file of files) {
        const filePath = path.join(I18N_DIR, file);
        const locale = file.replace('.json', '');

        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            translationData[locale] = content;
            allKeySets[locale] = new Set(getAllKeys(content));
            console.log(`✅ Loaded ${locale}: ${allKeySets[locale].size} keys`);
        } catch (error) {
            console.error(`❌ Error reading ${file}: ${error.message}`);
            process.exit(1);
        }
    }

    // Use the first file as reference
    const referenceLocale = files[0].replace('.json', '');
    const referenceKeys = allKeySets[referenceLocale];

    console.log(
        `\n📋 Using ${referenceLocale} as reference (${referenceKeys.size} keys)`
    );

    let hasErrors = false;

    // Check each locale against reference
    for (const locale of Object.keys(allKeySets)) {
        if (locale === referenceLocale) continue;

        const currentKeys = allKeySets[locale];
        const missingKeys = [...referenceKeys].filter(
            (key) => !currentKeys.has(key)
        );
        const extraKeys = [...currentKeys].filter(
            (key) => !referenceKeys.has(key)
        );

        if (missingKeys.length > 0 || extraKeys.length > 0) {
            hasErrors = true;
            console.log(`\n❌ ${locale}.json has differences:`);

            if (missingKeys.length > 0) {
                console.log(`  Missing keys (${missingKeys.length}):`);
                missingKeys.forEach((key) => console.log(`    - ${key}`));
            }

            if (extraKeys.length > 0) {
                console.log(`  Extra keys (${extraKeys.length}):`);
                extraKeys.forEach((key) => console.log(`    + ${key}`));
            }
        } else {
            console.log(`✅ ${locale}.json: All keys match`);
        }
    }

    if (hasErrors) {
        console.log('\n❌ Translation validation failed');
        console.log('💡 All translation files must have the same keys');
        process.exit(1);
    } else {
        console.log('\n✅ All translation files have matching keys');
    }
}

if (require.main === module) {
    validateTranslations();
}

module.exports = { validateTranslations };
