import { CheckIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/outline'
import clsx from 'clsx'
import { User } from 'common/user'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from 'web/components/buttons/button'
import { WatchQuestionModal } from 'web/components/contract/watch-question-modal'
import { Row } from 'web/components/layout/row'
import { useRealtimeContractFollows } from 'web/hooks/use-follows-supabase'
import {
  Contract,
  followContract,
  unFollowContract,
} from 'web/lib/firebase/contracts'
import { firebaseLogin, updateUser } from 'web/lib/firebase/users'
import { track } from 'web/lib/service/analytics'

export const FollowQuestionButton = (props: {
  contract: Contract
  user: User | undefined | null
}) => {
  const { contract, user } = props
  const followers = useRealtimeContractFollows(contract.id)
  const [open, setOpen] = useState(false)

  const watching = followers?.includes(user?.id ?? 'nope')

  return (
    <Button
      size="sm"
      onClick={async () => {
        if (!user) return firebaseLogin()
        if (followers?.includes(user.id)) {
          unfollowQuestion(contract.id, contract.slug, user)
        } else {
          followQuestion(contract.id, contract.slug, user)
        }
        if (!user.hasSeenContractFollowModal) {
          await updateUser(user.id, {
            hasSeenContractFollowModal: true,
          })
          setOpen(true)
        }
      }}
    >
      {watching ? (
        <Row className={'items-center gap-x-2 sm:flex-row'}>
          <EyeOffIcon className={clsx('h-5 w-5')} aria-hidden="true" />
          Unwatch
        </Row>
      ) : (
        <Row className={'items-center gap-x-2 sm:flex-row'}>
          <EyeIcon className={clsx('h-5 w-5')} aria-hidden="true" />
          Watch
        </Row>
      )}
      <WatchQuestionModal
        open={open}
        setOpen={setOpen}
        title={`You ${
          followers?.includes(user?.id ?? 'nope') ? 'watched' : 'unwatched'
        } a question!`}
      />
    </Button>
  )
}

export async function unfollowQuestion(
  contractId: string,
  contractSlug: string,
  user: User
) {
  await unFollowContract(contractId, user.id)
  toast("You'll no longer receive notifications from this question", {
    icon: <CheckIcon className={'h-5 w-5 text-teal-500'} />,
  })
  track('Unwatch Question', {
    slug: contractSlug,
  })
}

export async function followQuestion(
  contractid: string,
  contractslug: string,
  user: User
) {
  await followContract(contractid, user.id)
  toast("You'll now receive notifications from this question!", {
    icon: <CheckIcon className={'h-5 w-5 text-teal-500'} />,
  })
  track('Watch Question', {
    slug: contractslug,
  })
}