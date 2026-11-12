// Preserve each member's starting allocation. Loss goes to the acting member
// first, then the remaining active members; recovery fills existing capacities.
export function reconcileDisposition(team, actingId) {
  const allocation=team.individualDisposition;if(!allocation)return;
  const ids=[actingId,...(team.participantIds??[])].filter((id,i,all)=>allocation[id]&&all.indexOf(id)===i);
  let delta=Number(team.disposition.current)-Object.values(allocation).reduce((n,row)=>n+Number(row.current),0);
  for(const id of ids){const row=allocation[id];const amount=delta<0?-Math.min(row.current,-delta):Math.min(row.start-row.current,delta);row.current+=amount;delta-=amount;if(!delta)break;}
  if(delta)throw new Error('Disposition cannot be reconciled with the original allocation.');
}
