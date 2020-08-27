import Express from 'express';

const testRouter = Express.Router();

testRouter.get('/upload', (req, res) => {
	res.render('test_upload.ejs');
});

export { testRouter };