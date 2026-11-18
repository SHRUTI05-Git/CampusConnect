import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import { BookOpen, CalendarDays, MessageSquare, Users, LayoutDashboard, LogOut, GraduationCap, Plus, Search, Bell, Menu, X, Sparkles } from "lucide-react";
import api from "./api";

const initialUser = () => { try { return JSON.parse(localStorage.getItem("cc_user")); } catch { return null; } };
function App() {
  const [user,setUser] = useState(initialUser);
  const [menu,setMenu] = useState(false);
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem("cc_token"); localStorage.removeItem("cc_user"); setUser(null); navigate("/login"); };
  useEffect(() => { if (localStorage.getItem("cc_token")) api.get("/auth/me").then(r => { setUser(r.data.user); localStorage.setItem("cc_user", JSON.stringify(r.data.user)); }).catch(logout); }, []);
  const login = data => { localStorage.setItem("cc_token",data.token); localStorage.setItem("cc_user",JSON.stringify(data.user)); setUser(data.user); navigate("/"); };
  if (!user) return <Routes><Route path="/register" element={<AuthPage mode="register" onAuth={login}/>} /><Route path="*" element={<AuthPage mode="login" onAuth={login}/>} /></Routes>;
  const links = [{to:"/",label:"Overview",icon:LayoutDashboard},{to:"/notes",label:"Study resources",icon:BookOpen},{to:"/groups",label:"Study partners",icon:Users},{to:"/events",label:"Campus events",icon:CalendarDays},{to:"/forum",label:"Discussion forum",icon:MessageSquare}];
  return <div className="app-shell">
    <aside className={`sidebar ${menu?"open":""}`}>
      <div className="brand"><div className="brand-icon"><GraduationCap size={23}/></div><div><b>CampusConnect</b><small>YOUR CAMPUS, CONNECTED</small></div><button className="mobile-close" onClick={()=>setMenu(false)}><X/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{links.map(l=><NavLink onClick={()=>setMenu(false)} end={l.to==="/"} to={l.to} className={({isActive})=>isActive?"nav-link active":"nav-link"} key={l.to}><l.icon size={18}/>{l.label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><Sparkles size={18}/><b>Make campus life easier</b><p>Share knowledge. Find your people. Grow together.</p></div><div className="user-mini"><div className="avatar">{user.name?.[0]?.toUpperCase()}</div><div className="user-info"><b>{user.name}</b><small>{user.role} · {user.department || "Campus member"}</small></div><button title="Logout" onClick={logout}><LogOut size={17}/></button></div></div>
    </aside>
    {menu && <div className="scrim" onClick={()=>setMenu(false)}/>}
    <main className="main-area"><header className="topbar"><button className="mobile-menu" onClick={()=>setMenu(true)}><Menu/></button><div className="breadcrumb">Campus / <b>{links.find(l=>l.to===location.pathname)?.label || "Workspace"}</b></div><div className="top-actions"><span className="welcome">Welcome back, {user.name.split(" ")[0]}</span><div className="top-avatar">{user.name?.[0]?.toUpperCase()}</div></div></header>
      <div className="page-wrap"><Routes>
        <Route path="/" element={<Dashboard user={user}/>} />
        <Route path="/notes" element={<Notes user={user}/>} />
        <Route path="/groups" element={<Groups/>}/>
        <Route path="/events" element={<Events user={user}/>} />
        <Route path="/forum" element={<Forum user={user}/>} />
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes></div>
    </main>
  </div>;
}

function AuthPage({mode,onAuth}) {
  const [form,setForm]=useState({name:"",email:"",password:"",role:"student",department:"Computer Engineering",year:"Third Year"});
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=async e=>{e.preventDefault();setError("");setBusy(true);try{const {data}=await api.post(`/auth/${mode}`,form);onAuth(data);}catch(e){setError(e.response?.data?.message||"Unable to connect to server");}finally{setBusy(false);}};
  return <div className="auth-layout"><div className="auth-art"><div className="auth-logo"><GraduationCap/> CampusConnect</div><div className="art-copy"><span className="eyebrow">THE CAMPUS COMMUNITY PLATFORM</span><h1>Good things happen when students connect.</h1><p>Your space to learn together, share resources, discover events and build your campus community.</p><div className="art-stats"><div><b>Learn</b><small>Share knowledge</small></div><div><b>Connect</b><small>Find your people</small></div><div><b>Grow</b><small>Build together</small></div></div></div></div>
  <div className="auth-panel"><form className="auth-form" onSubmit={submit}><div className="mobile-auth-brand"><GraduationCap/> CampusConnect</div><span className="eyebrow">{mode==="login"?"WELCOME BACK":"GET STARTED"}</span><h2>{mode==="login"?"Sign in to your campus":"Create your account"}</h2><p className="muted">{mode==="login"?"Continue where your campus community left off.":"Join students and faculty in one connected space."}</p>
  {mode==="register"&&<><label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your name" required/></label><label>I am a<select name="role" value={form.role} onChange={change}><option value="student">Student</option><option value="faculty">Faculty member</option></select></label><div className="form-row"><label>Department<input name="department" value={form.department} onChange={change}/></label><label>Year<select name="year" value={form.year} onChange={change}><option>First Year</option><option>Second Year</option><option>Third Year</option><option>Final Year</option><option>Faculty</option></select></label></div></>}
  <label>Email address<input name="email" type="email" value={form.email} onChange={change} placeholder="you@college.edu" required/></label><label>Password<input name="password" type="password" value={form.password} onChange={change} placeholder="At least 6 characters" minLength="6" required/></label>
  {error&&<div className="error">{error}</div>}<button className="primary-btn full" disabled={busy}>{busy?"Please wait...":mode==="login"?"Sign in":"Create account"}</button><p className="switch-auth">{mode==="login"?"New to CampusConnect?":"Already have an account?"} <a href={mode==="login"?"/register":"/login"}>{mode==="login"?"Create an account":"Sign in"}</a></p></form></div></div>;
}

function PageHeading({eyebrow,title,description,action}) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>; }
function Dashboard({user}) {
 const [stats,setStats]=useState({notes:0,events:0,posts:0,students:0}); const [events,setEvents]=useState([]); const [posts,setPosts]=useState([]);
 useEffect(()=>{Promise.all([api.get("/notes"),api.get("/events"),api.get("/posts"),api.get("/auth/students")]).then(([n,e,p,s])=>{setStats({notes:n.data.length,events:e.data.length,posts:p.data.length,students:s.data.length});setEvents(e.data.slice(0,3));setPosts(p.data.slice(0,3));}).catch(()=>{});},[]);
 return <><PageHeading eyebrow="YOUR CAMPUS AT A GLANCE" title={`Hello, ${user.name.split(" ")[0]} 👋`} description="Here’s what’s happening in your campus community today."/><div className="hero-banner"><div><span className="hero-tag">CAMPUS COMMUNITY</span><h2>Learn together.<br/>Achieve together.</h2><p>Discover resources, meet study partners and stay in the loop.</p><a className="hero-link" href="/notes">Explore study resources <span>→</span></a></div><div className="hero-graphic"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="hero-cap"><GraduationCap size={72}/></div><span className="float-card float-a">✦ Share knowledge</span><span className="float-card float-b">↗ Grow together</span></div></div>
 <div className="stat-grid">{[[BookOpen,stats.notes,"Study resources","Available materials"],[CalendarDays,stats.events,"Campus events","Events posted"],[MessageSquare,stats.posts,"Discussions","Community posts"],[Users,stats.students,"Students","In the community"]].map(([Icon,num,label,sub])=><div className="stat-card" key={label}><div className="stat-icon"><Icon size={19}/></div><b className="stat-number">{num}</b><strong>{label}</strong><small>{sub}</small></div>)}</div>
 <div className="content-grid"><section className="panel"><div className="panel-head"><div><h3>Upcoming events</h3><p>What’s happening around campus</p></div><a href="/events">View all →</a></div>{events.length?events.map(e=><div className="compact-item" key={e._id}><div className="date-tile"><b>{new Date(e.date).getDate()}</b><small>{new Date(e.date).toLocaleString("en",{month:"short"})}</small></div><div><b>{e.title}</b><small>{e.venue||"Campus"} · {e.createdBy?.name||"Campus team"}</small></div></div>):<Empty text="No events yet. Check back soon!"/>}</section>
 <section className="panel"><div className="panel-head"><div><h3>Community conversations</h3><p>Latest from the discussion forum</p></div><a href="/forum">Join in →</a></div>{posts.length?posts.map(p=><div className="post-preview" key={p._id}><b>{p.title}</b><p>{p.body.slice(0,100)}{p.body.length>100?"…":""}</p><small>By {p.author?.name||"Campus member"}</small></div>):<Empty text="Be the first to start a discussion!"/>}</section></div></>;
}
function Empty({text}) {return <div className="empty-state"><div>✧</div><p>{text}</p></div>;}
function Notes({user}) {
 const [items,setItems]=useState([]),[query,setQuery]=useState(""),[show,setShow]=useState(false),[error,setError]=useState("");
 const [form,setForm]=useState({title:"",subject:"",semester:"",description:"",resourceUrl:""});
 const load=()=>api.get("/notes").then(r=>setItems(r.data)).catch(e=>setError(e.response?.data?.message||"Could not load resources"));
 useEffect(()=>{load();},[]);
 const submit=async e=>{e.preventDefault();try{await api.post("/notes",form);setForm({title:"",subject:"",semester:"",description:"",resourceUrl:""});setShow(false);load();}catch(e){setError(e.response?.data?.message||"Unable to add resource");}};
 const remove=async id=>{if(confirm("Delete this resource?")){await api.delete(`/notes/${id}`);load();}};
 const filtered=items.filter(n=>(n.title+" "+n.subject+" "+n.description).toLowerCase().includes(query.toLowerCase()));
 return <><PageHeading eyebrow="LEARN & SHARE" title="Study resources" description="A shared library of notes, presentations and useful learning links." action={<button className="primary-btn" onClick={()=>setShow(!show)}><Plus size={17}/> Share resource</button>}/>
 {show&&<form className="panel create-form" onSubmit={submit}><h3>Add a study resource</h3><div className="form-row"><label>Resource title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Subject<input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label></div><div className="form-row"><label>Semester<input value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} placeholder="e.g. Semester 5"/></label><label>Resource URL<input type="url" required placeholder="https://..." value={form.resourceUrl} onChange={e=>setForm({...form,resourceUrl:e.target.value})}/></label></div><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><button className="primary-btn">Publish resource</button></form>}
 <div className="toolbar"><div className="search-box"><Search size={18}/><input placeholder="Search by title, subject..." value={query} onChange={e=>setQuery(e.target.value)}/></div><span>{filtered.length} resources</span></div>{error&&<div className="error">{error}</div>}<div className="resource-grid">{filtered.map(n=><article className="resource-card" key={n._id}><div className="resource-top"><div className="resource-icon"><BookOpen/></div><span className="pill">{n.semester||"Study material"}</span></div><h3>{n.title}</h3><b className="subject">{n.subject}</b><p>{n.description||"Shared learning resource for the campus community."}</p><div className="resource-footer"><small>Shared by {n.uploader?.name||"Campus member"}</small><div><a href={n.resourceUrl} target="_blank" rel="noreferrer">Open ↗</a>{(n.uploader?._id===user.id||user.role==="admin")&&<button onClick={()=>remove(n._id)}>Delete</button>}</div></div></article>)}</div>{!filtered.length&&<Empty text="No matching resources found. Share the first one!"/>}</>;
}
function Groups() {
 const [students,setStudents]=useState([]),[q,setQ]=useState("");
 useEffect(()=>{api.get("/auth/students").then(r=>setStudents(r.data)).catch(()=>{});},[]);
 const list=students.filter(s=>(s.name+" "+s.department+" "+s.year+" "+(s.interests||[]).join(" ")).toLowerCase().includes(q.toLowerCase()));
 return <><PageHeading eyebrow="FIND YOUR PEOPLE" title="Study partners" description="Discover students across your campus and find people to learn with."/><div className="toolbar"><div className="search-box"><Search size={18}/><input placeholder="Search name, department or year..." value={q} onChange={e=>setQ(e.target.value)}/></div><span>{list.length} students</span></div><div className="people-grid">{list.map(s=><div className="person-card" key={s._id}><div className="person-avatar">{s.name[0]}</div><h3>{s.name}</h3><p>{s.department||"Department not added"}</p><span className="pill">{s.year||"Student"}</span><div className="interest-list">{(s.interests||[]).map(x=><span key={x}>{x}</span>)}</div></div>)}</div>{!list.length&&<Empty text="No students found yet."/>}</>;
}
function Events({user}) {
 const [items,setItems]=useState([]),[show,setShow]=useState(false),[msg,setMsg]=useState("");
 const [form,setForm]=useState({title:"",description:"",date:"",venue:""});
 const load=()=>api.get("/events").then(r=>setItems(r.data)).catch(()=>{});
 useEffect(()=>{load();},[]);
 const submit=async e=>{e.preventDefault();try{await api.post("/events",form);setShow(false);setForm({title:"",description:"",date:"",venue:""});load();setMsg("Event published successfully");}catch(e){setMsg(e.response?.data?.message||"Faculty/admin accounts can publish events");}};
 const register=async id=>{try{const r=await api.post(`/events/${id}/register`);setMsg(r.data.message);load();}catch(e){setMsg("Could not register for this event");}};
 const remove=async id=>{if(confirm("Delete this event?")){await api.delete(`/events/${id}`);load();}};
 return <><PageHeading eyebrow="WHAT'S HAPPENING" title="Campus events" description="Discover workshops, talks, celebrations and activities around campus." action={["faculty","admin"].includes(user.role)&&<button className="primary-btn" onClick={()=>setShow(!show)}><Plus size={17}/> Create event</button>}/>
 {show&&<form className="panel create-form" onSubmit={submit}><h3>Publish a campus event</h3><label>Event title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><div className="form-row"><label>Date and time<input type="datetime-local" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Venue<input value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})}/></label></div><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><button className="primary-btn">Publish event</button></form>}
 {msg&&<div className="notice">{msg}</div>}<div className="event-grid">{items.map(e=><article className="event-card" key={e._id}><div className="event-date"><b>{new Date(e.date).getDate()}</b><span>{new Date(e.date).toLocaleString("en",{month:"long"})}</span><small>{new Date(e.date).getFullYear()}</small></div><div className="event-info"><span className="eyebrow">CAMPUS EVENT</span><h3>{e.title}</h3><p>{e.description||"Join the campus community for this event."}</p><div className="event-meta"><span>⌖ {e.venue||"Venue to be announced"}</span><span>◷ {new Date(e.date).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span></div><div className="event-actions"><button className="outline-btn" onClick={()=>register(e._id)}>Register · {e.attendees?.length||0}</button>{(e.createdBy?._id===user.id||user.role==="admin")&&<button className="text-btn" onClick={()=>remove(e._id)}>Delete</button>}</div></div></article>)}</div>{!items.length&&<Empty text="No events have been published yet."/>}</>;
}
function Forum({user}) {
 const [items,setItems]=useState([]),[show,setShow]=useState(false),[form,setForm]=useState({title:"",body:""}),[comment,setComment]=useState({});
 const load=()=>api.get("/posts").then(r=>setItems(r.data)).catch(()=>{});
 useEffect(()=>{load();},[]);
 const submit=async e=>{e.preventDefault();await api.post("/posts",form);setForm({title:"",body:""});setShow(false);load();};
 const addComment=async id=>{if(!comment[id]?.trim())return;await api.post(`/posts/${id}/comments`,{body:comment[id]});setComment({...comment,[id]:""});load();};
 const remove=async id=>{if(confirm("Delete this discussion?")){await api.delete(`/posts/${id}`);load();}};
 return <><PageHeading eyebrow="SHARE YOUR THOUGHTS" title="Discussion forum" description="Ask questions, exchange ideas and learn from your campus community." action={<button className="primary-btn" onClick={()=>setShow(!show)}><Plus size={17}/> Start discussion</button>}/>{show&&<form className="panel create-form" onSubmit={submit}><h3>Start a conversation</h3><label>Discussion title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Your message<textarea required value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></label><button className="primary-btn">Publish discussion</button></form>}<div className="forum-list">{items.map(p=><article className="panel forum-card" key={p._id}><div className="forum-author"><div className="avatar">{p.author?.name?.[0]||"C"}</div><div><b>{p.author?.name||"Campus member"}</b><small>{p.author?.role||"member"} · {new Date(p.createdAt).toLocaleDateString()}</small></div>{(p.author?._id===user.id||user.role==="admin")&&<button className="text-btn delete-post" onClick={()=>remove(p._id)}>Delete</button>}</div><h3>{p.title}</h3><p className="forum-body">{p.body}</p><div className="comments"><b>{p.comments?.length||0} replies</b>{p.comments?.map((c,i)=><div className="comment" key={i}><b>{c.author?.name||"Member"}</b><span>{c.body}</span></div>)}<div className="comment-input"><input placeholder="Write a reply..." value={comment[p._id]||""} onChange={e=>setComment({...comment,[p._id]:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addComment(p._id)}/><button onClick={()=>addComment(p._id)}>Reply</button></div></div></article>)}</div>{!items.length&&<Empty text="No discussions yet. Start the first conversation!"/>}</>;
}
export default App;
