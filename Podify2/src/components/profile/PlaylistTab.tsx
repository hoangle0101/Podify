import EmptyRecords from '@ui/EmptyRecords';
import PlaylistItem from '@ui/PlaylistItem';
import {FC} from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import { useMutation, useQueryClient } from 'react-query';
import {useDispatch} from 'react-redux';
import {Playlist, RemovePlaylist} from 'src/@types/audio';
import { getClient } from 'src/api/client';
import {useFetchPlaylist} from 'src/hooks/query';
import {
  updatePlaylistVisbility,
  updateSelectedListId,
} from 'src/store/playlistModal';

interface Props {}

const PlaylistTab: FC<Props> = props => {
  const {data, isFetching} = useFetchPlaylist();
  const dispatch = useDispatch();
  const queryClient =useQueryClient();
  const handleOnListPress = (playlist: Playlist) => {
    dispatch(updateSelectedListId(playlist.id));
    dispatch(updatePlaylistVisbility(true));
  };

  const removeMutation = useMutation({
    mutationFn: async playlist => removePlaylist(playlist),
    onMutate: (playlist: string[]) => {
      queryClient.setQueryData<RemovePlaylist[]>(['playlist'], oldData => {
        let newData: RemovePlaylist[] = [];
        if (!oldData) return newData;

        for (let data of oldData) {
          if(Array.isArray(data.playlists)){
          const filterd = data?.playlists.filter(
            item => playlist.includes(item.id),
          );
          if (filterd.length && filterd.length) {
            newData.push({ playlists: filterd});
          }
        }
        }

        return newData;
      });
    },
  });

  const handleRemovePlaylist = async( playlist:Playlist)=>{

  removeMutation.mutate([playlist.id]);
  };

  const removePlaylist = async (playlist: string[]) => {
    const client = await getClient();
    await client.delete('/playlist?all=yes&playlistId=' +playlist);
    queryClient.invalidateQueries({queryKey: ['playlist']});
 
  };

  return (
    <ScrollView style={styles.container}>
      {!data?.length ? <EmptyRecords title="There is no playlist!" /> : null}
      {data?.map(playlist => {
        return (
          <PlaylistItem
          isFetching= {isFetching}
          handleRemovePlaylist= {()=> handleRemovePlaylist(playlist)}
       
            onPress={() => handleOnListPress(playlist)}
            key={playlist.id}
            playlist={playlist}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default PlaylistTab;
