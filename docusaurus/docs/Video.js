import React from 'react'
import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './video.module.css'

const links = {
  drag: { label: 'useDrag', link: 'hooks#list-of-hooks' },
  wheel: { label: 'useWheel', link: 'hooks#list-of-hooks' },
  pinch: { label: 'usePinch', link: 'hooks#list-of-hooks' },
  move: { label: 'useMove', link: 'hooks#list-of-hooks' },
  initial: { label: 'initial', link: 'options#initial' },
  rubberband: { label: 'rubberband', link: 'options#rubberband' },
  touchaction: { label: 'touch-action', link: 'extras#touch-action' }
}

const Video = ({ video, id, badges }) => {
  const baseUrl = useBaseUrl('/')
  return (
    <div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://codesandbox.io/s/${id}`}
      >
        <video autoPlay muted playsInline loop width="100%">
          <source src={video} type="video/mp4" />
        </video>
      </a>
      {badges && (
        <div className={styles.badges}>
          {badges.map((b, i) => (
            <Link
              key={i}
              to={`${baseUrl}docs/${links[b].link}`}
              className="badge badge--info"
            >
              {links[b].label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Video
