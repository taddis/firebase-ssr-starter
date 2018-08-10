/* globals firebase */
import React from 'react';
import { Button } from 'rmwc/Button';
import ImageUpload from '../form/image-upload';
import deleteImage from '../../utilities/storage/delete-image';

import '@material/button/dist/mdc.button.min.css';
import './settings.css';

export default function ProfileImage({ settings, setSettings }) {
  return (
    <div className="profile-image">
      {settings.photoUrl ? (
        <div className="form-row">
          <img src={settings.photoUrl} alt="profile image" />
          <Button raised onClick={clearPhotoUrl(setSettings, settings.photoUrlPath)}>
            Remove/Replace
          </Button>
        </div>
      ) : (
        <ImageUpload
          url={settings.photoUrl}
          height="250px"
          width="250px"
          options={{ height: 250, width: 250 }}
          onComplete={async ({ url, path }) => setSettings({ photoUrl: url, photoUrlPath: path })}
          buttonText="Select profile image"
        />
      )}
    </div>
  );
}

function clearPhotoUrl(setSettings, path) {
  const deleteValue = firebase.firestore.FieldValue.delete();

  return async () => {
    await setSettings({ photoUrl: deleteValue, photoUrlPath: deleteValue });
    return deleteImage(path);
  };
}
