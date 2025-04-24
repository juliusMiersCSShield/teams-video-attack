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
  /*const [userId, setUserId] = useState<string>('8:acs:1658075f-1e5e-4cc0-9772-9034242f2ba8_00000027-068e-9944-28d2-493a0d00b96e');*/
  /*const [token, setToken] = useState<string>('eyJhbGciOiJSUzI1NiIsImtpZCI6IkRCQTFENTczNEY1MzM4QkRENjRGNjA4NjE2QTQ5NzFCOTEwNjU5QjAiLCJ4NXQiOiIyNkhWYzA5VE9MM1dUMkNHRnFTWEc1RUdXYkEiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjE2NTgwNzVmLTFlNWUtNGNjMC05NzcyLTkwMzQyNDJmMmJhOF8wMDAwMDAyNy0wNjhlLTk5NDQtMjhkMi00OTNhMGQwMGI5NmUiLCJzY3AiOjE3OTIsImNzaSI6IjE3NDU0NzkzMzMiLCJleHAiOjE3NDU1NjU3MzMsInJnbiI6ImRlIiwiYWNzU2NvcGUiOiJjaGF0LHZvaXAiLCJyZXNvdXJjZUlkIjoiMTY1ODA3NWYtMWU1ZS00Y2MwLTk3NzItOTAzNDI0MmYyYmE4IiwicmVzb3VyY2VMb2NhdGlvbiI6Imdlcm1hbnkiLCJpYXQiOjE3NDU0NzkzMzN9.bzvQO71Aj53J5aOwWbfaKlqUBOswWcsuAANhmDLD1vHjNWWnjDOYL1Q9lMtPOaUti0DCCNustJOrOzWQ27Dy5t39iTeTF3zErYghpHsIatEWujyCkvWICsV2Uax9l5nFlJeBWqQDxynEnJ8QrooIvy3wDHw5e7jriiVUN8k4SS0TcS9kN1i_8G_n8M55ZrxozQwoOCKSIciJTYxpsgUHsfPyOfQ2yritJYzEuNXu82HEVqnoMMwPBRcNVaRjIeQ6ewKgB78_9e8nnPCuum7zNW4CknrCc2Bumtt-DfhvT2lxNodwjmzbcmpG459cvdbv5MacczNciD1TQUxosEgwFg');*/
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