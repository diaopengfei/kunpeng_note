const express=require('express');
const expressStatic=require('express-static');
const session=require('express-session');
const multer=require('multer');
const bodyParser=require('body-parser');
const fs=require('fs');
const ejs=require('ejs');
const mysql=require('mysql');

//定义数据库连接池
const db=mysql.createPool({
	host:'localhost',
	user:'root',
	password:'yzdpf19971015',
	database:'kunpeng_note',
	multipleStatements:true,
});
//创建服务器
var server=express();
server.listen(80);//监听端口
//session中间件
server.use(session({
	name:'session',//cookie的名字
	secret:'kunpeng wolf',//签名
	cookie:{maxAge:1000*60*60*2},//有效期
	resave:false,//重新保存
	saveUninitialized:false
}));
server.use(bodyParser.urlencoded({extended:false}));//解析post
server.get('/',function(req,res){	
	if (req.session.login){
		res.redirect('/index');
	}else{
		res.redirect('/login');
	}
});



// 处理主页请求
server.get('/index',function(req,res){
	if(req.session.login){
		db.query("SELECT id,title,content,finishtime,state,importance FROM dailytasks WHERE username='"+req.session.username+"';"+"SELECT id,title,starttime,finishtime,importance,state FROM plans WHERE username='"+req.session.username+"';",
			function(err,data){
				if (err) {
					res.redirect('/login');
					console.log(err);
				}else{
					ejs.renderFile('./views/index.html',
					{
						dailytasks:data[0],
						plans:data[1]
					},
					function(err,data){
						if (err) {
							console.log(err);
						}else{
							res.send(data.toString()).end();
						}
					});
				}
		});
	}else{
		res.redirect('/login');
	}
});
server.get('/index/getheadimage',function(req,res){
	if(req.session.login){
		fs.exists('./upload/headimage/'+req.session.username+'.jpg',
			function(exist){
				if (exist) {
					fs.readFile('./upload/headimage/'+req.session.username+'.jpg',
						function(err,file){
							if (err) {
								console.log(err);
								res.send('err').end();
							}else{
								res.status(200).type('image/jpeg').send(file).end();
							}
						});
				}else{
					fs.readFile('./views/image/headimg.jpg',
						function(err,file){
							console.log(req.session.username);
							if (err) {
								console.log(err);
								res.send('err').end();
							}else{
								res.status(200).type('image/jpeg').send(file).end();
							}
						});
				}
			});
	}else{
		res.redirect('/login');
	}
});
//保存日常任务
server.post('/index/saveAdd',function(req,res){
	if(req.session.login){
		task=req.body;
		console.log(task);
		db.getConnection(function(err,connection){
			if (err) {
				res.status(200).json({ok:0,id:0}).end();
			}else{
				connection.query("INSERT INTO dailytasks (username,title,content,finishtime,state,importance) VALUES('"+req.session.username+"','"+task.title+"','"+task.content+"','"+task.finishtime+"',"+task.state+","+task.importance+");",
					function(err,data){
						if(err){
							console.log(err);
							res.status(200).json({ok:0,id:0}).end();
						}else{
							connection.query("SELECT LAST_INSERT_ID();",
								function(err,data){
									if (err) {
										res.status(200).json({ok:0,id:0}).end();
									}else{
										res.status(200).json({ok:1,id:data[0]['LAST_INSERT_ID()']}).end();
									}
								});
						}
					});
				connection.release();
			}
		});
	}else{
		res.redirect('/login');
	}
});
//删除日常任务
server.post('/index/deleteTask',function(req,res){
	if (req.session.login) {
		task=req.body;
		db.query("DELETE FROM dailytasks WHERE id="+task.id+" AND username='"+req.session.username+"';",
			function(err,data){
				if(err){
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
//修改日常任务
server.post('/index/modifyTask',function(req,res){
	if (req.session.login){
		task=req.body;
		db.query("UPDATE dailytasks SET title='"+task.title+"',content='"+task.content+"',finishtime='"+task.finishtime+"',state="+task.state+",importance="+task.importance+" WHERE id="+task.id+" AND username='"+req.session.username+"';",
			function(err,data){
				if(err){
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
//完成日常任务
server.post('/index/finishTask',function(req,res){
	if (req.session.login) {
		taskid=req.body;
		db.query("UPDATE dailytasks SET state=1 WHERE id="+taskid.id+" AND username='"+req.session.username+"';",
			function(err,data){
				if (err) {
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
//恢复完成的日常任务到未完成中
server.post('/index/recoverTask',function(req,res){
	if (req.session.login) {
		taskid=req.body;
		db.query("UPDATE dailytasks SET state=0 WHERE id="+taskid.id+" AND username='"+req.session.username+"';",
			function(err,data){
				if (err) {
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
server.post('/index/setState',function(req,res){
	if(req.session.login){
		plan=req.body;
		req.session.menu=plan.menu;
		req.session.taskState=plan.taskState;
		req.session.planState=plan.planState;
		req.session.plan_taskState=plan.plan_taskState;
		req.session.theplanid=plan.theplanid;
		req.session.theplanstate=plan.theplanstate;
		res.status(200).json({ok:1}).end();
	}else{
		res.redirect('/login');
	}
});
server.post('/index/getState',function(req,res){
	if (req.session.login) {
		res.status(200).json({
			menu:req.session.menu,
			taskState:req.session.taskState,
			planState:req.session.planState,
			plan_taskState:req.session.plan_taskState,
			theplanid:req.session.theplanid,
			theplanstate:req.session.theplanstate
		}).end();
	}else{
		res.redirect('/login');
	}
});
//保存计划
server.post('/index/addPlan',function(req,res){
	if (req.session.login) {
		plan=req.body;
		console.log(plan);
		db.getConnection(function(err,connection){
			if (err) {
				res.status(200).json({ok:0,id:0}).end();
			}else{
				connection.query("INSERT INTO plans (username,title,starttime,finishtime,importance,state) VALUES('"+req.session.username+"','"+plan.title+"','"+plan.starttime+"','"+plan.finishtime+"',"+plan.importance+","+plan.state+");",
					function(err,data){
						if(err){
							console.log(err);
							res.status(200).json({ok:0,id:0}).end();
						}else{
							connection.query("SELECT LAST_INSERT_ID();",
								function(err,data){
									if (err) {
										res.status(200).json({ok:0,id:0}).end();
									}else{
										res.status(200).json({ok:1,id:data[0]['LAST_INSERT_ID()']}).end();
									}
								});
						}
					});
				connection.release();
			}
		});
	}else{
		res.redirect('/login');
	}
});
//修改计划
server.post('/index/modifyPlan',function(req,res){
	if (req.session.login){
		plan=req.body;
		db.query("UPDATE plans SET title='"+plan.title+"',starttime='"+plan.starttime+"',finishtime='"+plan.finishtime+"',importance="+plan.importance+",state="+plan.state+" WHERE id="+plan.id+" AND username='"+req.session.username+"';",
			function(err,data){
				if(err){
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
//完成计划
server.post('/index/finishPlan',function(req,res){
	if (req.session.login) {
		plan=req.body;
		db.query("UPDATE plans SET state=1 WHERE id="+plan.id+" AND username='"+req.session.username+"';",
			function(err,data){
				if (err) {
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
//恢复完成的计划
server.post('/index/recoverPlan',function(req,res){
	if (req.session.login) {
		plan=req.body;
		db.query("UPDATE plans SET state=0 WHERE id="+plan.id+" AND username='"+req.session.username+"';",
			function(err,data){
				if (err) {
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
//删除计划
server.post('/index/deletePlan',function(req,res){
	if (req.session.login) {
		plan=req.body;
		db.query("DELETE FROM plans WHERE id="+plan.id+" AND username='"+req.session.username+"';DELETE FROM plan_tasks WHERE plan_id="+plan.id+" AND username='"+req.session.username+"';",
			function(err,data){
				if(err){
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
//获取计划内容
server.post('/index/getplanTasks',function(req,res){
	if(req.session.login){
		plan=req.body;
		req.session.theplanid=plan.theplanid;
		db.query("SELECT id,plan_id,title,content,starttime,state FROM plan_tasks WHERE plan_id="+plan.theplanid+" AND username='"+req.session.username+"';",
			function(err,data){
				if (err) {
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1,plan_tasks:data}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
//计划内容开始
server.post('/index/addplanTask',function(req,res){
	if (req.session.login) {
		task=req.body;
		console.log(task);
		db.getConnection(function(err,connection){
			if (err) {
				res.status(200).json({ok:0,id:0}).end();
			}else{
				connection.query("INSERT INTO plan_tasks (username,plan_id,title,content,starttime,state) VALUES('"+req.session.username+"',"+task.plan_id+",'"+task.title+"','"+task.content+"','"+task.starttime+"',"+task.state+");",
					function(err,data){
						if(err){
							console.log(err);
							res.status(200).json({ok:0,id:0}).end();
						}else{
							connection.query("SELECT LAST_INSERT_ID();",
								function(err,data){
									if (err) {
										res.status(200).json({ok:0,id:0}).end();
									}else{
										res.status(200).json({ok:1,id:data[0]['LAST_INSERT_ID()']}).end();
									}
								});
						}
					});
				connection.release();
			}
		});
	}else{
		res.redirect('/login');
	}
});
server.post('/index/modifyplanTask',function(req,res){
	if (req.session.login){
		task=req.body;
		db.query("UPDATE plan_tasks SET title='"+task.title+"',content='"+task.content+"',starttime='"+task.starttime+"',state="+task.state+" WHERE id="+task.id+" AND plan_id="+task.plan_id+" AND username='"+req.session.username+"';",
			function(err,data){
				if(err){
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
server.post('/index/finishplanTask',function(req,res){
	if (req.session.login) {
		task=req.body;
		db.query("UPDATE plan_tasks SET state=1 WHERE id="+task.id+" AND plan_id="+task.plan_id+" AND username='"+req.session.username+"';",
			function(err,data){
				if (err) {
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
server.post('/index/recoverplanTask',function(req,res){
	if (req.session.login) {
		task=req.body;
		db.query("UPDATE plan_tasks SET state=0 WHERE id="+task.id+" AND plan_id="+task.plan_id+" AND username='"+req.session.username+"';",
			function(err,data){
				if (err) {
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});
server.post('/index/deleteplanTask',function(req,res){
	if (req.session.login) {
		task=req.body;
		db.query("DELETE FROM plan_tasks WHERE id="+task.id+" AND plan_id="+task.plan_id+" AND username='"+req.session.username+"';",
			function(err,data){
				if(err){
					console.log(err);
					res.status(200).json({ok:0}).end();
				}else{
					res.status(200).json({ok:1}).end();
				}
			});
	}else{
		res.redirect('/login');
	}
});

//设置头像
//定义中间件储存对象
var storage = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,'upload/headimage/');
	},
	filename:function(req,file,cb){
		cb(null,req.session.username+'.jpg');
	}
});
//中间件
var upload = multer({storage:storage});
server.post('/index/upload',upload.single('headimg'),function(req,res){
	if (req.session.login) {
		res.redirect('/index');
	}else{
		res.redirect('/login');
	}
});
//注销账户
server.get('/index/logout',function(req,res){
	req.session.destroy(function(err){
		if (err) {
			console.log(err);
			res.redirect('/login');
		}else{
			res.redirect('/login');
		}
	});
});


//处理登陆页请求
server.get('/login',function(req,res){
	if (req.session.login){
		res.redirect('/index');
	}else{
		fs.readFile('./views/login.html',function(err, data){
			res.write(data.toString());
			res.end();
		});
	}
});

//处理登陆请求
server.post('/login',function(req,res){
	user=req.body;
	console.log(user);
	db.query("SELECT * FROM users WHERE username='"+user.username+"'",
		function(err,data){
			if(err){
				res.status(200).send('alert("网站数据库挂了~")').end();
			}else {
				if (data.length===0) {
					res.status(200).send('alert("用户名不存在！")').end();
				}else if(data[0].password!==user.password){
					res.status(200).send('alert("用户名或密码错误！")').end();
				}else{
					req.session.login=true;
					req.session.username=user.username;
					req.session.menu=1;
					req.session.taskState=0;
					req.session.planState=0;
					req.session.plan_taskState=0;
					req.session.theplanid=0;
					req.session.theplanstate=0;
					res.status(200).send('window.location.href="/index";').end();
				}
			}
		});
});



//处理注册页请求
server.get('/register',function(req,res){
	if (req.session.login) {
		res.redirect('/index');
	}else{
		fs.readFile('./views/register.html',function(err, data){
			res.write(data.toString());
			res.end();
		});
	}
});
server.post('/register',function(req,res){
	user=req.body;
	console.log(user);
	db.query("SELECT * FROM users WHERE username='"+user.username+"'",
		function(err,data){
			if(err){
				res.status(200).send('alert("网站数据库挂了~")').end();
			}else{
				if (data.length!==0) {
					res.status(200).send('alert("该用户名已存在！");').end();
				}else if (user.password1!==user.password2) {
					res.status(200).send('alert("两次输入密码不一致！");').end();
				}else {
					db.query("INSERT INTO users (id,username,password) VALUES(0,'"+user.username+"','"+user.password1+"');",
						function(err,data){
							if (err) {
								res.status(200).send('alert("网站数据库挂了~")').end();
							}else{
								res.status(200).send('alert("注册成功！");window.location.href="/login";').end();
							}
						});
				}
			}
		});
});
//处理页面静态链接请求
server.use(expressStatic('./'));