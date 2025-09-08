const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export async function request(path, opts = {}){
  const headers = opts.headers || {};
  const token = localStorage.getItem('token');
  if(token) headers['Authorization'] = 'Bearer ' + token;
  headers['Content-Type'] = 'application/json';
  const res = await fetch(API_BASE + path, { ...opts, headers });
  const json = await res.json().catch(()=>({}));
  if(!res.ok) throw json;
  return json;
}

export default { request };
