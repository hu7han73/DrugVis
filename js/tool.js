// DrugVis
// By: Han Hu (hh255@njit.edu; https://github.com/hu7han73)
// License: BSD

// @Date    : 2018-07-15 18:55:01
// @Author  : Chao Ma (cma1@kent.edu)
// @Website : http://vis.cs.kent.edu/NeighborVis/
// @Link    : https://github.com/AlexMa1989
// @Version : $Id$

/*
    tool.js
    Note: this file contains tool functions
*/

var TOOL = TOOL || {};

TOOL.parseDate = function(input) {
    return Date.parse(input) / 1000;
}

TOOL.daysBetween = function( date1, date2 ) {  
var one_day=60*60*24;  
var date1_ms = date1;   
var date2_ms = date2;  
 var difference_ms = date2_ms - date1_ms; 
return Math.round(difference_ms/one_day); 
 }

TOOL.monthDateRange = function(startDate, endDate) {

    var start      = startDate.split('-');
      var end        = endDate.split('-');
      var startYear  = parseInt(start[0]);
      var endYear    = parseInt(end[0]);
      var dates      = [];

      for(var i = startYear; i <= endYear; i++) {
        var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
        var startMon = i === startYear ? parseInt(start[1])-1 : 0;
        for(var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j+1) {
          var month = j+1;
          var displayMonth = month < 10 ? '0'+month : month;
          dates.push([i, displayMonth, '01'].join('-'));
        }
      }
      return dates;

}

TOOL.yearDateRange = function(startDateRaw, endDateRaw) {

    var date_splited = startDateRaw.split("-");
    var startyear = parseInt(date_splited[0]);
    var startmonth = parseInt(date_splited[1]);
    var startdate = parseInt(date_splited[2]);

    var date_splitede = endDateRaw.split("-");
    var endyear = parseInt(date_splitede[0]);
    var endmonth = parseInt(date_splitede[1]);
    var enddate = parseInt(date_splitede[2]);

    var startDate = startyear.toString() + "-" + startmonth.toString() + "-" + startdate.toString();
    var endDate = endyear.toString() + "-" + endmonth.toString() + "-" + enddate.toString();

     var d1 = new Date(startDate),
        d2 = new Date(endDate),
        yr = [];

    for (var i=d1.getFullYear(); i<=d2.getFullYear(); i++) {
        yr.push( i );
    }

    return yr;

}

String.isStopWord = function(word) {
    var regex = new RegExp("\\b" + word + "\\b", "i");
    if (TOOL.stopword.search(regex) < 0) {
        return false;
    } else {
        return true;
    }
}

String.prototype.removeStopWords = function() {
    words = new Array();

    this.replace(/\b[\w]+\b/g,
        function($0) {
            if (!String.isStopWord($0)) {
                words[words.length] = $0.trim();
            }
        }
    );
    return words.join(" ");
}

// List of all stop word
// Add more word that you need to eliminate
TOOL.stopword = "a,able,about,above,abst,accordance,according,accordingly,across,act,actually,added,adj,\
affected,affecting,affects,after,afterwards,again,against,ah,all,almost,alone,along,already,also,although,\
always,am,among,amongst,an,and,announce,another,any,anybody,anyhow,anymore,anyone,anything,anyway,anyways,\
anywhere,apparently,approximately,are,aren,arent,arise,around,as,aside,ask,asking,at,auth,available,away,awfully,\
b,back,be,became,because,become,becomes,becoming,been,before,beforehand,begin,beginning,beginnings,begins,behind,\
being,believe,below,beside,besides,between,beyond,biol,both,brief,briefly,but,by,c,ca,came,can,cannot,can't,cause,causes,\
certain,certainly,co,com,come,comes,contain,containing,contains,could,couldnt,d,date,did,didn't,different,do,does,doesn't,\
doing,done,don't,down,downwards,due,during,e,each,ed,edu,effect,eg,eight,eighty,either,else,elsewhere,end,ending,enough,\
especially,et,et-al,etc,even,ever,every,everybody,everyone,everything,everywhere,ex,except,f,far,few,ff,fifth,first,five,fix,\
followed,following,follows,for,former,formerly,forth,found,four,from,further,furthermore,g,gave,get,gets,getting,give,given,gives,\
giving,go,goes,gone,got,gotten,h,had,happens,hardly,has,hasn't,have,haven't,having,he,hed,hence,her,here,hereafter,hereby,herein,\
heres,hereupon,hers,herself,hes,hi,hid,him,himself,his,hither,home,how,howbeit,however,hundred,i,id,ie,if,i'll,im,immediate,\
immediately,importance,important,in,inc,indeed,index,information,instead,into,invention,inward,is,isn't,it,itd,it'll,its,itself,\
i've,j,just,k,keep,keeps,kept,kg,km,know,known,knows,l,largely,last,lately,later,latter,latterly,least,less,lest,let,lets,like,\
liked,likely,line,little,'ll,look,looking,looks,ltd,m,made,mainly,make,makes,many,may,maybe,me,mean,means,meantime,meanwhile,\
merely,mg,might,million,miss,ml,more,moreover,most,mostly,mr,mrs,much,mug,must,my,myself,n,na,name,namely,nay,nd,near,nearly,\
necessarily,necessary,need,needs,neither,never,nevertheless,new,next,nine,ninety,no,nobody,non,none,nonetheless,noone,nor,\
normally,nos,not,noted,nothing,now,nowhere,o,obtain,obtained,obviously,of,off,often,oh,ok,okay,old,omitted,on,once,one,ones,\
only,onto,or,ord,other,others,otherwise,ought,our,ours,ourselves,out,outside,over,overall,owing,own,p,page,pages,part,\
particular,particularly,past,per,perhaps,placed,please,plus,poorly,possible,possibly,potentially,pp,predominantly,present,\
previously,primarily,probably,promptly,proud,provides,put,q,que,quickly,quite,qv,r,ran,rather,rd,re,readily,really,recent,\
recently,ref,refs,regarding,regardless,regards,related,relatively,research,respectively,resulted,resulting,results,right,run,s,\
said,same,saw,say,saying,says,sec,section,see,seeing,seem,seemed,seeming,seems,seen,self,selves,sent,seven,several,shall,she,shed,\
she'll,shes,should,shouldn't,show,showed,shown,showns,shows,significant,significantly,similar,similarly,since,six,slightly,so,\
some,somebody,somehow,someone,somethan,something,sometime,sometimes,somewhat,somewhere,soon,sorry,specifically,specified,specify,\
specifying,still,stop,strongly,sub,substantially,successfully,such,sufficiently,suggest,sup,sure,t,take,taken,taking,tell,tends,\
th,than,thank,thanks,thanx,that,that'll,thats,that've,the,their,theirs,them,themselves,then,thence,there,thereafter,thereby,\
thered,therefore,therein,there'll,thereof,therere,theres,thereto,thereupon,there've,these,they,theyd,they'll,theyre,they've,\
think,this,those,thou,though,thoughh,thousand,throug,through,throughout,thru,thus,til,tip,to,together,too,took,toward,towards,\
tried,tries,truly,try,trying,ts,twice,two,u,un,under,unfortunately,unless,unlike,unlikely,until,unto,up,upon,ups,us,use,used,\
useful,usefully,usefulness,uses,using,usually,v,value,various,'ve,very,via,viz,vol,vols,vs,w,want,wants,was,wasn't,way,we,wed,\
welcome,we'll,went,were,weren't,we've,what,whatever,what'll,whats,when,whence,whenever,where,whereafter,whereas,whereby,wherein,\
wheres,whereupon,wherever,whether,which,while,whim,whither,who,whod,whoever,whole,who'll,whom,whomever,whos,whose,why,widely,\
willing,wish,with,within,without,won't,words,world,would,wouldn't,www,x,y,yes,yet,you,youd,you'll,your,youre,yours,yourself,\
yourselves,you've,z,zero,um,yeah,uh,Ms,Paolucci,pd,p,NULL,null"; // add um,yeah,uh