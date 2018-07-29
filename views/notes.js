/*
Notes Flex library

21/07/2018

*/
var flex = {};
flex = {
    pop:function(type,url,callback,titleText="",farmid){
        if(document.getElementById("flex_frame"))
        {
        document.getElementById("flex_frame").remove();
        }
        var mainframe = document.createElement('div');
        var title = document.createElement('div');
        var content = document.createElement('div');
        var close = document.createElement('div');
        title.setAttribute('class','title');
        mainframe.setAttribute('class','mainframe');
        mainframe.setAttribute('id','flex_frame');
        close.setAttribute('class','close');
        content.setAttribute('class','content');
        close.innerHTML="X";
        close.addEventListener("click",function(e){
            document.getElementById("flex_frame").remove();
        });
        if(type=="0")
        {
            $.get(url,function(data){
                content.innerHTML=data;
                title.innerHTML =titleText;
                var body = document.getElementsByTagName('body')[0];
                mainframe.appendChild(close);
                mainframe.appendChild(title);
                mainframe.appendChild(content);
                body.appendChild(mainframe);
                mainframe.addEventListener("keyup",function(data){
                    console.log(data);
                });
                mainframe.focus();
                flex.placeAtCenter(mainframe);
                if(callback!=null)
                {
                    callback(farmid);
                }

            })  }
    },
placeAtCenter:function(obj)
{
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    obj.style.minWidth="20em";
    obj.style.minHeight="14em";
    var dimension = obj.getBoundingClientRect();
    obj.style.top = (screenHeight/2)-(dimension.height/2)+"px";
    obj.style.left = ((screenWidth/2)-(dimension.width/2))+"px";
    obj.style.position = "absolute";
},
popclose:function()
{
    document.getElementById("flex_frame").remove();
}

};