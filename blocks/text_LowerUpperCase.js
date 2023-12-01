module.exports = {
    name: "Text Modify Case",

    description: "Modifies the case of a string. (By @JoanJuan10)",

    category: "Text",

    inputs: [
        {
            "id": "action",
            "name": "Action",
            "description": "Acceptable Types: Action\n\nDescription: Executes this block.",
            "types": ["action"]
        },
        {
            "id": "source",
            "name": "Source Text",
            "description": "Acceptable Types: Unspecified, Text\n\nDescription: Modifies the case of a string.",
            "types": ["unspecified", "text"]
        }
    ],

    options: [
        {
            id: "operation",
            name: "Operation Type",
            description: "Description: What to convert the text into",
            type: "SELECT",
            options: {
                "upper": "Uppercase",
                "lower": "Lowercase"
            }
        }
    ],

    outputs: [
        {
            "id": "action",
            "name": "Action",
            "description": "Type: Action\n\nDescription: Executes the following blocks when this block finishes its task.",
            "types": ["action"]
        },
        {
            "id": "resulttext",
            "name": "Text",
            "description": "Type: Text\n\nDescription: The converted text",
            "types": ["text"]
        },
    ],

    code(cache) {
        var content = this.GetInputValue("source", cache);
        var operation = this.GetOptionValue("operation", cache);

        if (operation === 'upper') {
            this.StoreOutputValue(content.toUpperCase(), "resulttext", cache);
        }
        else {
            this.StoreOutputValue(content.toLowerCase(), "resulttext", cache);
        }

        this.RunNextBlock("action", cache);
    }
}