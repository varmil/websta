exports.createUniqueID = function(){
	var randam = Math.floor(Math.random()*1000);
	var date = new Date();
	var time = date.getTime();
	return randam + time.toString();
};
