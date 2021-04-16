const config = require('config.json');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const hbs = require('nodemailer-express-handlebars');
const email = config.email;
const pass = config.password;
const nodemailer = require('nodemailer');
var path = require("path");
const user = db.User;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    resetLink,
    setPassword,
    deleteUser,
    truncate
};

async function authenticate({ email, password }) {
    const user_found = await user.findOne({ email })
    .exec();
    if (user_found && bcrypt.compareSync(password, user_found.password_hash)) {
        const { password_hash, ...userWithoutHash } = user_found.toObject();
        const token = jwt.sign({ sub: user_found._id, role: user_found.role }, config.secret, { expiresIn:'360d' });
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll(request) {

    let query = request.query;
    let options = {
        limit: parseInt(query.limit>0? query.limit:10),
        page: parseInt(query.page>0? query.page:1),
    }
    delete query['limit'];
    delete query['page'];

    return await user.paginate(query,options);

}

async function getById(id) {
    try{

        let result= await user.findById(id).select('-password_hash');
        if(!result) throw "Not_found"
        return result;
    }catch(e){
        throw "Not_found"
    }
}

async function create(request_param) {
  
    console.log("request Param", request_param)
    // validate
    const existingUser = await user.findOne({ email: request_param.email });
   // console.log(existingUser);
    if (existingUser) {
        throw 'Already_existed';
    }
      
    const user_record = new user(request_param);
    console.log("userRecord",user_record)
    // hash password
    if (request_param.password) {
        user_record.password_hash = bcrypt.hashSync(request_param.password, 10);
    }

    // save user
    return await user_record.save();
}

async function update(id, userParam, decoded) {
    const record = await user.findById(id);
    if (!record) throw 'Not_found';
    if(decoded.role == "admin"){
        if (record.email !== userParam.email && await user.findOne({ email: userParam.email })) {
            throw 'Already_existed';
        }
        // hash password if it was entered
        if (userParam.password) {
            record.password_hash = bcrypt.hashSync(userParam.password, 10);
        }
        // copy userParam properties to user
        Object.assign(record, userParam);
        return await record.save();
    }else if(id == decoded.sub){

        if(userParam["status"])
            delete userParam["status"];

        if(userParam["role"])
            delete userParam["role"];

        if (record.email !== userParam.email && await user.findOne({ email: userParam.email })) {
            throw 'Already_existed';
        }
        // hash password if it was entered
        if (userParam.password) {
            record.password_hash = bcrypt.hashSync(userParam.password, 10);
        }
        // copy userParam properties to user
        Object.assign(record, userParam);
        return await record.save();
    }else{
        throw "Unauthorized_request";
    }
}



async function resetLink(userParam) {
    const user = await user.findOne({ user_name: userParam.username });

    // validate
    if (!user) throw 'user not found';
    const token = jwt.sign({ sub: user.id }, config.secret);
    const smtpTransport = nodemailer.createTransport({
      service:'Gmail',
      auth: {
        user: email,
        pass: pass
      }
    });    
    const handlebarsOptions = {
        viewEngine: {
            extName: '.html',
            partialsDir: path.resolve('./templates/'),
            layoutsDir:  path.resolve('./templates/'),
            defaultLayout:  path.resolve('./templates/')+'/forgot-password-email.html',
        },
        viewPath: path.resolve('./templates/'),
        extName: '.html'
    };

    smtpTransport.use('compile', hbs(handlebarsOptions));

    const data = {
        to: user.username,
        from: email,
        template: 'forgot-password-email',
        subject: 'Reset Password!',
        context: {
          url: 'http://localhost:4200/reset_password?token=' + token,
          name: user.firstName
        }
    };
    console.log("called smpt");
    smtpTransport.sendMail(data, function(err) {
        if (!err) {
            return {
                
                message: 'Kindly check your email for further instructions' };
        }else {
            return err;
        }
    });
}



async function setPassword(userParam) {
    var _id = userParam.id;
    const current_user = await user.findById({ _id });    
    
    if (!current_user) throw 'Not_found';

    var password_hash = "";
    if (userParam.password) {

        password_hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(current_user, {password_hash: password_hash});

    await current_user.save();
}


async function deleteUser(id, decoded) {
    if(decoded.role == "admin"){
        try{
           let result= await user.findByIdAndRemove(id);
           if(!result) throw "Not_found"
        }catch(e){
            throw "Not_found";
        }
    }else{
        throw "Unauthorized_request";
    }
}

async function truncate(request, decoded) {
    if(decoded.role == "admin"){
        try {
            let result = await user.remove({});
            return result;
        } catch (e) {
            throw "Not_found"
        }
    }else{
        throw "Unauthorized_request";
    }
}
