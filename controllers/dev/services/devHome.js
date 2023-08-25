exports.devHome = async(req, res) => {
    try {
        // res.render('home', {StartingContent: homeStartingContent, posts: posts});
        return  res.render('admin');
    } catch (error) {
        return
    }
}