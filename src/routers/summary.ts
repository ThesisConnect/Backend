import express from 'express';
import * as _ from "lodash";
import Summary from "../models/summary";
import {uuidv4} from "@firebase/util";

const router = express.Router();

router.get('/data/:id', async (req, res) => {
    if (req.params.id) {
        const summary = await Summary.findById(req.params.id);
        if (!summary) {
        res.status(400).send({found: false});
        return;
        }
        const sentData = {...summary.toObject(), found: true};
        return res.status(200).send(_.omit(sentData, ["_id", "__v"]));
    }
    }
)

router.post("/create", async (req, res) => {
    const result = await Summary.create({
        project_id: req.body.project_id,
        plan_id: req.body.plan_id,
        reciever_id: req.body.reciever_id,
        sender_id: req.body.sender_id,
        comment: req.body.comment,
        progress: 0,
        file_id: req.body.file_id,
    });
    if (result) {
        return res.status(200).send(result);
    } else {
        return res.status(400).send("Bad request");
    }
})

export default router;