import Express from 'express';

const fileRouter = Express.Router();

fileRouter.get('/upload', (req, res) => {
	console.log(req.baseUrl);
	res.send('dsabdsajdhaso');
});

export { fileRouter };