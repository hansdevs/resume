class Config {
    constructor() {
        this.apiKey = null;
        this.binId = null;
        this.loaded = false;
        this.masterCode = null;
    }

    deriveCredentials(masterCode) {
        this.masterCode = masterCode;
        const salt = "cordinova_secure_2024";
        const seed = CryptoJS.MD5(masterCode + salt).toString();
        
        const keyMap = {
            "37f203943db163d65db3568889b5068a": {
                apiKey: "$2a$10$GCXfVOFGqjqUu/9N0XDjeeNHNtHdPY/qle1fH8n4Wdmqg3c2UGpFu",
                binId: "68abc74f43b1c97be92894b2"
            }
        };

        const masterHash = CryptoJS.MD5(masterCode).toString();
        const credentials = keyMap[masterHash];

        if (credentials) {
            this.apiKey = credentials.apiKey;
            this.binId = credentials.binId;
            this.loaded = true;
            return true;
        }
        return false;
    }

    getApiKey() {
        return this.apiKey;
    }

    getBinId() {
        return this.binId;
    }

    isLoaded() {
        return this.loaded;
    }
}

const config = new Config();
