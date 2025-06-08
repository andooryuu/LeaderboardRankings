import  Performance  from './Performance';

interface UserScore {
id: number;
  username: string;
  scores: Array<{
    activity_name: string;
    activities: Performance;
  }>;
}
export default UserScore;