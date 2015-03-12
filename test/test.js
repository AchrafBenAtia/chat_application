var request = require('superagent');
var expect = require('expect.js');

describe('Chat application Test', function(){
  
  it('Add User', function(done){
  	 request.post('http://localhost:3000/signup')
  	 	.send({ username : 'aaaaaaaaaaaaaaa',
  	 			password : '0000',
  	 			email : 'achrafbzezeenatia@gmzezail.com',
  	 			firstName : 'achrezeaf',
  	 			lastName : 'benatzezeia'
  	 	})
  	 	.end(function(e,res){
        // console.log(res.body)
        expect(e).to.eql(null)
        done()

  });
  });

  });