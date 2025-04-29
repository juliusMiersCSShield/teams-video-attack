import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from '@azure/communication-common';
import {  
  CallComposite, 
  fromFlatCommunicationIdentifier, 
  useAzureCommunicationCallAdapter 
} from '@azure/communication-react';
import React, { useState, useMemo, useEffect } from 'react';
import './App.css';

const App = () => { 
  const displayName = 'Guest'
  /*const [userId, setUserId] = useState<string>('8:acs:0113b716-c57d-4d3f-ae4f-32ebf284fe9a_00000027-2145-987b-0586-af3a0d00ce8c');*/
  /*const [token, setToken] = useState<string>('eyJhbGciOiJSUzI1NiIsImtpZCI6IkRCQTFENTczNEY1MzM4QkRENjRGNjA4NjE2QTQ5NzFCOTEwNjU5QjAiLCJ4NXQiOiIyNkhWYzA5VE9MM1dUMkNHRnFTWEc1RUdXYkEiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjAxMTNiNzE2LWM1N2QtNGQzZi1hZTRmLTMyZWJmMjg0ZmU5YV8wMDAwMDAyNy0yMTQ1LTk4N2ItMDU4Ni1hZjNhMGQwMGNlOGMiLCJzY3AiOjE3OTIsImNzaSI6IjE3NDU5Mjc1MzMiLCJleHAiOjE3NDYwMTM5MzMsInJnbiI6ImVtZWEiLCJhY3NTY29wZSI6ImNoYXQsdm9pcCIsInJlc291cmNlSWQiOiIwMTEzYjcxNi1jNTdkLTRkM2YtYWU0Zi0zMmViZjI4NGZlOWEiLCJyZXNvdXJjZUxvY2F0aW9uIjoiZXVyb3BlIiwiaWF0IjoxNzQ1OTI3NTMzfQ.ifP4mI1R_n65yePjqzoGRsCjqmQzs8R2NfLZj3-ITbqVjQbcqAJt34sYSTUEyTXLHLnqoIBkTL5AB61UbsIvEOho6IkJ1S0xPAFFKk-rQrkGwKmnq5-bgl2fUP2vre4wTYTeQY85r3aJGd1bG5NKcZMvudr7-UwcBvCGxAdwU3ZS_0FjrrTAR5Uo-Pywe2diXcdb6RO4kRQm0QMChV84ZaerBX6eReeimC127sEBAXB5LCbw1HMuqvWZt0M3Ata7RyOU92aXXODA8EuNXNjaBoWGzfJAig-Naj6tX3i9tbEFlddFCF8Y5S5rLrXf3NZAyYBYThUc79ls5LVIbWJ1iw');*/
  /*const [teamsMeetingLink, setTeamsMeetingLink] = useState<string>('https://teams.microsoft.com/l/meetup-join/19%3ameeting_MTNiOWNjOWItNzA0YS00YjYzLTlkZTItMzIzMGI5OTY0YmJl%40thread.v2/0?context=%7b%22Tid%22%3a%226049baec-8372-4386-b09f-1aab57aafa80%22%2c%22Oid%22%3a%22337840e5-c1f4-4652-96be-0895cfa99010%22%7d');*/
  const [userId, setUserId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [teamsMeetingLink, setTeamsMeetingLink] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const credential = useMemo(() => {
    if (token) {
      return new AzureCommunicationTokenCredential(token)
    }
    return;
    }, [token]);
  const callAdapterArgs = useMemo(() => {
    if (userId && credential && displayName && teamsMeetingLink) {
      return {
        userId: fromFlatCommunicationIdentifier(userId) as CommunicationUserIdentifier,
        displayName,
        credential,
        locator: { meetingLink: teamsMeetingLink },
      }
    }
    return {};
  }, [userId, credential, displayName, teamsMeetingLink]);

  /*console.dir(callAdapterArgs, { depth: null });*/
  const callAdapter = useAzureCommunicationCallAdapter(callAdapterArgs);
  /*console.dir(callAdapter, { depth: null });*/
  
  useEffect(() => {
    const init = async () => {
        setMessage('Getting ACS user');
        //Call Azure Function to get the ACS user identity and token
        let res = await fetch(process.env.REACT_APP_ACS_USER_FUNCTION as string);
        let user = await res.json();
        setUserId(user.userId);
        setToken(user.token);

        setMessage('Getting Teams meeting link...');
        //Call Azure Function to get the meeting link
        res = await fetch(process.env.REACT_APP_TEAMS_MEETING_FUNCTION as string);
        let link = await res.text();
        setTeamsMeetingLink(link);
        setMessage('');
        console.log('Teams meeting link', link);
    }
    init();

  }, []);

  if (callAdapter) {
    return (
      <div>
        <h1>Contact Customer Service</h1>
        <div className="wrapper">
          <CallComposite
            adapter={callAdapter}
          />
        </div>
      </div>
    );
  }
  if (!credential) {
    return <>Failed to construct credential. Provided token is malformed.</>;
  }
  if (message) {
    return <div>{message}</div>;
  }
  return <div>Initializing...</div>;
};

export default App;