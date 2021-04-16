module.exports= {
    successResponse,
    errorResponse,
    insertSuccess,
    updateSuccess,
    deleteSuccess,
    getSuccess
};

function successResponse(res,response){
    return  res.json({
        status:true,
        message: "Operation was successfull",
        data:response
    });
}

function insertSuccess(res,response){
    return  res.json({
        status:true,
        message: "Record inserted",
        data:response
    });
}

function updateSuccess(res,response){
    return  res.json({
        status:true,
        message: "Record updated",
        data:response
    });
}

function  deleteSuccess(res,response){
    return  res.json({
        status:true,
        message: "Record deleted",
        data:response
    });
}

function  getSuccess(res,response){
    return  res.json({
        status:true,
        message: "Records fetched",
        data:response
    });
}

function errorResponse(next,res,err){
    return  res.json({
        status:false,
        message: err,
        data:null
    });
}

