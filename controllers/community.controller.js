// 5. controllers/community.controller.js
const { CommunityQuestion, CommunityAnswer } = require('../models');

exports.postQuestion = async (req, res) => {
    try {
        const { title, content } = req.body;
        const question = await CommunityQuestion.create({
            title,
            content,
            user_id: req.user.id
        });
        res.status(201).json(question);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.answerQuestion = async (req, res) => {
    try {
        const { answer } = req.body;
        const question_id = req.params.id;
        const response = await CommunityAnswer.create({
            question_id,
            user_id: req.user.id,
            answer
        });
        res.status(201).json(response);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getQuestions = async (req, res) => {
    try {
        const questions = await CommunityQuestion.findAll();
        res.status(200).json(questions);
    }
    catch {
        res.status(400).json({ error: 'Error fetching questions' });
    }
}

exports.rateAnswer = async (req, res) => {
    try {
        const { id : answer_id } = req.params;

        const answer = await CommunityAnswer.findByPk(answer_id);
        if (!answer) {
            return res.status(404).json({ error: "Answer not found" });
        }

        answer.rating = (answer.rating || 0) + 1;
        await answer.save();

        res.status(200).json({ message: "Answer rated successfully", new_rating: answer.rating });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.rateQuestion = async (req, res) => {
    try {
        const { id : question_id } = req.params;
        console.log(question_id);
        const answer = await CommunityQuestion.findByPk(question_id);
        if (!answer) {
            return res.status(404).json({ error: "Question not found" });
        }

        answer.rating = (answer.rating || 0) + 1;
        await answer.save();

        res.status(200).json({ message: "Question rated successfully", new_rating: answer.rating });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAnswers = async (req, res) => {
    try {
        const { id : question_id } = req.params;
        const answers = await CommunityAnswer.findAll({ where: { question_id } });
        if(!answers) {
            return res.status(404).json({ error: "Answers not found" });
        }
        res.status(200).json(answers);
    }
    catch {
        res.status(400).json({ error: 'Error fetching answers' });
    }
}


const { Message, User } = require("../models");

exports.getCommunityMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: { receiver_id: null }, // Only community messages
            include: [
                {
                    model: User,
                    as: "sender",
                    attributes: ["id", "name"], // optional
                },
            ],
            order: [["createdAt", "ASC"]],
        });

        res.status(200).json(messages);
    } catch (err) {
        console.error("Error fetching community messages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};
