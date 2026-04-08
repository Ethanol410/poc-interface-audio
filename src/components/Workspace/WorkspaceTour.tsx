import { memo, useMemo } from 'react';
import { Joyride, EventData, Controls, Step, STATUS } from 'react-joyride';
import TourTooltip from './TourTooltip';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';

interface WorkspaceTourProps {
  run: boolean;
  onFinish: () => void;
}

const WorkspaceTour = memo(({ run, onFinish }: WorkspaceTourProps) => {
  const { isBrainCity } = useScenarioTheme();

  const handleJoyrideCallback = (data: EventData, _controls: Controls) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      onFinish();
    }
  };

  const steps: Step[] = useMemo(() => {
    if (isBrainCity) {
      return [
        {
          target: 'body',
          placement: 'center',
          title: 'SALUT LA JEUNE RECRUE !',
          content: "L'Inspecteur Ricardo Pouleto a besoin de toi ! Ta mission est de retrouver qui a fait le coup en écoutant cet enregistrement mystère ! Montrons leur de quoi on est capable.",
          disableBeacon: true,
        },
        {
          target: '#tour-waveform',
          title: 'LA PISTE AUDIO',
          content: "Voici l'enregistrement secret ! Clique dessus avec la souris pour écouter ou mettre en pause. Tu peux aussi avancer ou reculer ! Mets le à l'envers avec le bouton inverser.",
          disableBeacon: true,
        },
        {
          target: '#tour-tools',
          title: 'LES OUTILS DÉTECTIVE',
          content: "Ah ! Ce sont tes outils de détective ! Active l'éléphant, l'abeille... et nettoie moi ce son pour qu'on puisse entendre qui est le coupable !",
        },
        {
          target: '#tour-streamdeck',
          title: 'LES BOÎTIERS MAGIQUES',
          content: "Pas besoin de ta souris pour tout faire ! Tu peux utiliser les boîtiers physiques Stream Deck posés devant toi pour activer les outils et valider les suspects !",
        },
        {
          target: '#tour-spectrogram',
          title: 'LA CARTE DES SONS',
          content: "Cette drôle de carte représente les sons. Regarde comment elle change de couleur quand tu utilises tes outils magiques !",
        },
        {
          target: '#tour-clues',
          title: 'TES INDICES',
          content: "A chaque fois que tu vas trouver un son important caché, l'indice va s'afficher ici ! Essaye de tous les attraper !",
        },
        {
          target: '#tour-jaccuse',
          title: 'TU AS TROUVÉ ?',
          content: "Quand tu penses savoir qui est l'agresseur, clique très vite sur ce bouton pour l'accuser ! Bonne chance !",
        }
      ];
    } else {
      return [
        {
          target: 'body',
          placement: 'center',
          title: 'TRANSMISSION - AGENT V',
          content: "Agent, nous avons un nouveau dossier critique à traiter. Votre mission est d'identifier le suspect de cette affaire à partir de cet enregistrement vocal corrompu.",
          disableBeacon: true,
        },
        {
          target: '#tour-waveform',
          title: 'ANALYSE DE LA FORME D\'ONDE',
          content: "L'enregistrement intercepté. Vous pouvez lancer la lecture, mettre en pause, et naviguer précisément dans l'audio. Notez le mode A/B pour comparer.",
          disableBeacon: true,
        },
        {
          target: '#tour-tools',
          title: 'MODULES DE TRAITEMENT',
          content: "Station de nettoyage audio. Activez et ajustez les filtres (Low-pass, High-pass), le pitch et observez l'impact direct sur les anomalies du signal.",
        },
        {
          target: '#tour-streamdeck',
          title: 'CONTRÔLES PHYSIQUES (STREAM DECK)',
          content: "Pour plus de réactivité, vous avez à disposition des interfaces physiques Stream Deck devant vous. Elles vous permettent d'opérer directement les filtres et de visualiser les suspects.",
        },
        {
          target: '#tour-spectrogram',
          title: 'SPECTROGRAMME',
          content: "Visualisation avancée du signal continu. Permet d'isoler visuellement les bruits de fond, interférences ou chuchotements. Crucial pour identifier les fréquences cibles.",
        },
        {
          target: '#tour-clues',
          title: 'INDICES RESTAURÉS',
          content: "Dès que vos réglages font ressortir une signature sonore nette, le système valide automatiquement l'indice ici. Réunissez toutes les occurrences.",
        },
        {
          target: '#tour-jaccuse',
          title: 'IDENTIFICATION CRÉDITÉE',
          content: "Dès que l'écoute est suffisamment claire, passez au module d'identification vocale pour confondre le suspect. Fin de transmission.",
        }
      ];
    }
  }, [isBrainCity]);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleJoyrideCallback}
      tooltipComponent={TourTooltip}
      options={{
        showProgress: true,
        zIndex: 1000,
        overlayColor: isBrainCity ? 'rgba(7, 59, 76, 0.75)' : 'rgba(0, 0, 0, 0.85)',
        primaryColor: isBrainCity ? '#118AB2' : '#00ffd1',
      }}
    />
  );
});

export default WorkspaceTour;
