import { HStack, useToast, VStack } from 'native-base';
import { Share } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { useEffect, useState } from 'react';

import { api } from '../services/api'

import { Header } from '../components/Header';
import { Guesses } from '../components/Guesses';
import { Loading } from '../components/Loading';
import { Option } from '../components/Option'
import { EmptyMyPollList } from '../components/EmptyMyPollList';
import { PollCardProps } from '../components/PollCard'
import { PollHeader } from '../components/PollHeader';

interface RouteParams {
    id: string;
}

export function Details() {
    const [optionSelected, setOptionSelected] = useState<'guesses' | 'ranking'>('guesses')
    const [isLoading, setIsLoading] = useState(true)
    const [pollDetails, setPollDetails] = useState<PollCardProps>({} as PollCardProps)
    
    const route = useRoute()
    const toast = useToast()
    const { id } = route.params as RouteParams

    async function fetchPollDetails() {
        try {
            setIsLoading(true)

            const response = await api.get(`/polls/${id}`)
            setPollDetails(response.data.poll)

        } catch (error) {
            console.log(error)

            toast.show({
                title: 'Não foi carregar os dados do bolão.',
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCodeShare() {
        await Share.share({
            message: pollDetails.code
        })
    }

    useEffect(() => {
        fetchPollDetails();
    }, [id])

    if(isLoading) {
        return (
            <Loading />
        )
    }

    return (
        <VStack flex={1} bgColor="gray.900">
           <Header 
            title={pollDetails.title} 
            showBackButton 
            showShareButton 
            onShare={handleCodeShare}
           /> 
           
           {

            pollDetails._count?.participants > 0 ?
            <VStack px={5} flex={1}>
                <PollHeader data={pollDetails}/>

                <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
                    <Option 
                        title="Seus palpites" 
                        isSelected={optionSelected === 'guesses'}
                        onPress={() => setOptionSelected('guesses')}
                    />

                    <Option 
                        title="Ranking do grupo" 
                        isSelected={optionSelected === 'ranking'}
                        onPress={() => setOptionSelected('ranking')}
                    />
                </HStack>

                <Guesses pollId={pollDetails.id} code={pollDetails.code}/>
            </VStack>
            
            : <EmptyMyPollList code={pollDetails.code}/>
           }

        </VStack>
    );
}