class API {
    static async featchMaskData() {
        const content = await fetch("https://raw.githubusercontent.com/lycheetw/mask_raw_data/master/maskdata_latest.csv").then(it => it.text()).then(it => csv2Json(it));
        const obj = {}
        content.forEach(it => {
            obj[it["醫事機構代碼"]] = it
        })
        return obj;
    }
}

function csv2Json(csv) {
    const lines = csv.split('\r\n')
    const colNames = lines[0].split(',');
    return lines.slice(1).map(line => {
        const obj = {};
        const col = line.split(',');
        colNames.map((str, idx) => obj[str] = col[idx]);
        return obj;
    })
}

export default API