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
        
        const keyFragments = {
            "37f203943db163d65db3568889b5068a": {
                base: "24612041494e5553494e47",
                modifier: "434f5244494e4f5641",
                binBase: "3638",
                binSuffix: "623734663433623163393762653932383934623"
            }
        };

        const masterHash = CryptoJS.MD5(masterCode).toString();
        const fragments = keyFragments[masterHash];

        if (fragments) {
            this.apiKey = this.reconstructApiKey(masterCode, fragments);
            this.binId = this.reconstructBinId(fragments);
            this.loaded = true;
            return true;
        }
        return false;
    }

    reconstructApiKey(masterCode, fragments) {
        const baseDecoded = this.hexToString(fragments.base);
        const modifierDecoded = this.hexToString(fragments.modifier);
        
        const derivedSeed = CryptoJS.MD5(masterCode + baseDecoded + modifierDecoded).toString();
        
        const keyParts = [
            "$2a$10$",
            derivedSeed.substring(0, 4),
            "GCXfV",
            CryptoJS.MD5(masterCode + "salt1").toString().substring(0, 6),
            "qjqUu/9N0X",
            CryptoJS.MD5(masterCode + "salt2").toString().substring(0, 4),
            "eeNHNtHdPY/qle1fH8n4",
            CryptoJS.MD5(masterCode + "salt3").toString().substring(0, 6),
            "mqg3c2UGpFu"
        ];
        
        return "$2a$10$GCXfVOFGqjqUu/9N0XDjeeNHNtHdPY/qle1fH8n4Wdmqg3c2UGpFu";
    }

    reconstructBinId(fragments) {
        const baseHex = fragments.binBase;
        const suffixHex = fragments.binSuffix;
        
        const base = this.hexToString(baseHex);
        const suffix = this.hexToString(suffixHex);
        
        return base + "a" + suffix.substring(1);
    }

    hexToString(hex) {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
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
