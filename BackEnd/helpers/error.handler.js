function errorHandler(err, req, res, next){
    if (err){
       return res.status(500).json({message: err});
    }

    return res.status(500).json(err);
}

module.exports = errorHandler;