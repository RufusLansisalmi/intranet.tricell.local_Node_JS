function loginFormCheck()
{
	if(document.loginform.femployeecode.value=="" || document.loginform.femployeecode.value.indexOf("-") == -1)
	{
       		alert("You must give an employee code!");
	        return false;
	}
	if(document.loginform.fpassword.value=="")
	{
       		alert("You must give a password!");
	        return false;
	}
}
