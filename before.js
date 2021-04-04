const WorkerPromise = f => {
 let resolve, reject, start, end;
 const worker = Object.assign(new Worker(
   URL.createObjectURL(new Blob([`onmessage = e=>postMessage((${f})(e.data));`],{type: 'text/javascript'}))
 ), {
  onmessage: e=> (resolve(e.data), next()),
  onerror: e=> (reject(e.data), next())
 });

 const next = _ => {
  if(!start.next) return;
  ({data, resolve, reject} = start.next);
  start = start.next;
  worker.postMessage(data);
 }

 return data => new Promise((res, rej)=> {
  const v = {data, resolve:res, reject: rej};
  if(end) end = end.next = v;
  else{
   start = end = v;
   resolve = res;
   reject = rej;
   worker.postMessage(data);
  }
 });
};
