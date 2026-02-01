if(localStorage.getItem("role")!=="admin")location.href="login.html";

const ordersDiv=document.getElementById("orders");

function loadOrders(){
  const orders=JSON.parse(localStorage.getItem("orders"))||[];
  ordersDiv.innerHTML="";
  let t=0,a=0,r=0;
  const today=new Date().toISOString().split("T")[0];

  orders.forEach((o,i)=>{
    if(o.date===today)t++;
    if(o.status==="Accepted")a++;
    if(o.status==="Rejected")r++;

    ordersDiv.innerHTML+=`
      <div class="card p-3 mb-2">
        Order #${i+1} | $${o.total} | ${o.status}
        <div>
          <button class="btn btn-success btn-sm"
            onclick="update(${i},'Accepted')">Accept</button>
          <button class="btn btn-danger btn-sm"
            onclick="update(${i},'Rejected')">Reject</button>
        </div>
      </div>`;
  });

  todayOrders.innerText=t;
  acc.innerText=a;
  rej.innerText=r;
}

function update(i,s){
  const o=JSON.parse(localStorage.getItem("orders"));
  o[i].status=s;
  localStorage.setItem("orders",JSON.stringify(o));
  loadOrders();
}

function logout(){localStorage.clear();location.href="login.html";}

loadOrders();
const todayOrders=document.getElementById("todayOrders");
const acc=document.getElementById("acc");
const rej=document.getElementById("rej");
loadOrders();
