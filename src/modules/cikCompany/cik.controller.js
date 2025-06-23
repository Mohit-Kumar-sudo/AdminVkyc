import cikService from './cik.service';

export async function getCikData(req, res) {
    let data;
    const { company } = req.params || ""
    try {
        data = await cikService.getCikData(company);
        if (data) {
            res.json(data)
        } else {
            res.json({ msg: "data not found" })
        }
    } catch (err) {
        res.status(500).json(err)
    }
}