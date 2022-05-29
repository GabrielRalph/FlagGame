// **** WARNING DO NOT MODIFY THIS FUNCTION. YOU SIMPLY CALL THIS FUNCTION  ****
function getCookie(NameOfCookie){
	if (document.cookie.length > 0)
	{
		let begin = document.cookie.indexOf(NameOfCookie+"=");
		if (begin != -1)
		{
			begin += NameOfCookie.length+1;
			let end = document.cookie.indexOf(";", begin);
			if (end == -1) end = document.cookie.length;
			return unescape(document.cookie.substring(begin, end));
		}
	}
	return null;
}

// **** WARNING DO NOT MODIFY THIS FUNCTION. YOU SIMPLY CALL THIS FUNCTION  ****
function setCookie(NameOfCookie, value, expiredays){
	let ExpireDate = new Date ();
	ExpireDate.setTime(ExpireDate.getTime() + (expiredays * 24 * 3600 * 1000));
	document.cookie = NameOfCookie + "=" + escape(value) +
	((expiredays == null) ? "" : "; expires=" + ExpireDate.toGMTString());
}

// **** WARNING DO NOT MODIFY THIS FUNCTION. YOU SIMPLY CALL THIS FUNCTION  ****
function delCookie (NameOfCookie){
	if (getCookie(NameOfCookie)){
		document.cookie = NameOfCookie + "=" +
		"; expires=Thu, 01-Jan-70 00:00:01 GMT";
	}
}

function setCookies(obj, exp) {
  for (let key in obj) {
    setCookie(key, obj[key], exp);
  }
}

function getCookies(obj) {
  for (let key in obj) {
    let value = getCookie(key);
    value = value == "undefined" || typeof value !== "string" ? null : value;
    console.log(value);
    obj[key] = value
  }
}

export {getCookie, setCookie, delCookie, setCookies, getCookies}
